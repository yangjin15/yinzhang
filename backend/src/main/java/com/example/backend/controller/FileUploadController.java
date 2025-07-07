package com.example.backend.controller;

import com.example.backend.common.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * 文件上传控制器
 */
@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileUploadController {

    @Value("${file.upload.path:uploads}")
    private String uploadPath;

    @Value("${file.upload.max-size:10485760}") // 10MB
    private long maxFileSize;

    /**
     * 上传文件
     */
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", defaultValue = "attachment") String type) {

        try {
            // 验证文件
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("文件不能为空"));
            }

            if (file.getSize() > maxFileSize) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("文件大小不能超过10MB"));
            }

            // 获取原始文件名
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("文件名不能为空"));
            }

            // 验证文件类型
            String fileExtension = getFileExtension(originalFilename);
            if (!isAllowedFileType(fileExtension)) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.badRequest("不支持的文件类型，仅支持：pdf, doc, docx, txt, jpg, png, jpeg"));
            }

            // 创建上传目录
            String dateFolder = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
            String uploadDir = uploadPath + File.separator + type + File.separator + dateFolder;
            Path uploadDirPath = Paths.get(uploadDir);

            if (!Files.exists(uploadDirPath)) {
                Files.createDirectories(uploadDirPath);
            }

            // 生成新文件名
            String newFilename = UUID.randomUUID().toString() + "." + fileExtension;
            Path filePath = uploadDirPath.resolve(newFilename);

            // 保存文件
            file.transferTo(filePath.toFile());

            // 构建文件访问URL
            String fileUrl = "/api/files/download/" + type + "/" + dateFolder + "/" + newFilename;

            // 返回结果
            Map<String, Object> result = new HashMap<>();
            result.put("filename", originalFilename);
            result.put("url", fileUrl);
            result.put("size", file.getSize());
            result.put("type", file.getContentType());

            return ResponseEntity.ok(ApiResponse.success("文件上传成功", result));

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("文件上传失败: " + e.getMessage()));
        }
    }

    /**
     * 下载文件
     */
    @GetMapping("/download/{type}/{year}/{month}/{day}/{filename}")
    public ResponseEntity<byte[]> downloadFile(
            @PathVariable String type,
            @PathVariable String year,
            @PathVariable String month,
            @PathVariable String day,
            @PathVariable String filename) {

        try {
            String filePath = uploadPath + File.separator + type + File.separator +
                    year + File.separator + month + File.separator + day + File.separator + filename;

            Path path = Paths.get(filePath);

            if (!Files.exists(path)) {
                return ResponseEntity.notFound().build();
            }

            byte[] data = Files.readAllBytes(path);

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                    .body(data);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 获取文件扩展名
     */
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1).toLowerCase();
    }

    /**
     * 验证文件类型
     */
    private boolean isAllowedFileType(String extension) {
        String[] allowedTypes = { "pdf", "doc", "docx", "txt", "jpg", "png", "jpeg", "xls", "xlsx" };
        for (String type : allowedTypes) {
            if (type.equals(extension)) {
                return true;
            }
        }
        return false;
    }
}