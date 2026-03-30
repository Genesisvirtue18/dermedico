package com.skincare.ecommerce.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class FileUploadService {

    @Value("${file.upload-dir}")
    private String uploadDir;


    public String upload(
            MultipartFile file)
            throws IOException {

        String fileName=
                System.currentTimeMillis()
                        +"_"+file.getOriginalFilename();

        Path path=
                Paths.get(uploadDir,fileName);

        Files.createDirectories(
                path.getParent());

        Files.write(
                path,
                file.getBytes());

        return "/uploads/"+fileName;
    }

}
