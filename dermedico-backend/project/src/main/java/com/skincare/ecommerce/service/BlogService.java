package com.skincare.ecommerce.service;


import com.skincare.ecommerce.dto.BlogRequest;
import com.skincare.ecommerce.dto.FaqDTO;
import com.skincare.ecommerce.entity.Blog;
import com.skincare.ecommerce.entity.BlogFaq;
import com.skincare.ecommerce.entity.BlogTag;
import com.skincare.ecommerce.entity.Category;
import com.skincare.ecommerce.repository.BlogRepo;
import com.skincare.ecommerce.repository.CategoryRepository;
import com.skincare.ecommerce.repository.FAQRepo;
import com.skincare.ecommerce.repository.TagRepo;
import lombok.RequiredArgsConstructor;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BlogService {

    private final BlogRepo blogRepo;
    private final CategoryRepository categoryRepo;
    private final FileUploadService uploadService;
    private final FAQRepo faqRepo; // ✅ ADD THIS
    private final TagRepo tagRepo; // ✅ ADD THIS

    @Value("${file.upload.dir}")
    private String uploadDir;


    // CREATE
    public Blog createBlog(

            BlogRequest request,

            MultipartFile mainImage,
            MultipartFile authorPhoto

    ) throws Exception {


        Blog blog=new Blog();

        blog.setTitle(request.getTitle());

        blog.setSubtitle(request.getSubtitle());

        blog.setHeading(request.getHeading());

        blog.setContent(request.getContent());

        blog.setSlug(request.getSlug());

        blog.setMetaTitle(request.getMetaTitle());

        blog.setMetaDescription(request.getMetaDescription());

        blog.setCreatedAt(LocalDateTime.now());


        Category category=
                categoryRepo.findById(
                                request.getCategoryId())
                        .orElseThrow();

        blog.setCategory(category);



        // MAIN IMAGE

        String img=
                uploadService.upload(mainImage);

        blog.setMainImage(img);



        // AUTHOR

        String authorImg=
                uploadService.upload(authorPhoto);

        blog.setAuthorPhoto(authorImg);

        blog.setAuthorName(
                request.getAuthorName());

        blog.setAuthorDescription(
                request.getAuthorDescription());



        // TAGS

        List<BlogTag> tagList=
                new ArrayList<>();

        for(String tag:
                request.getTags()){

            BlogTag t=new BlogTag();

            t.setTagName(tag);

            t.setBlog(blog);

            tagList.add(t);

        }

        blog.setTags(tagList);



        // FAQ

        List<BlogFaq> faqList=
                new ArrayList<>();

        for(FaqDTO faqDTO:
                request.getFaqs()){

            BlogFaq f=
                    new BlogFaq();

            f.setQuestion(
                    faqDTO.getQuestion());

            f.setAnswer(
                    faqDTO.getAnswer());

            f.setBlog(blog);

            faqList.add(f);

        }

        blog.setFaqs(faqList);



        return blogRepo.save(blog);

    }


    // GET ALL
    public List<Blog> getAllBlogs(){
        return blogRepo.findAll();
    }


    // GET ONE
    public Blog getBlog(Long id){

        return blogRepo.findById(id).orElseThrow();
    }


    // GET BY SLUG
    public Blog getBySlug(String slug){

        return blogRepo.findBySlug(slug)
                .orElseThrow();
    }


    // UPDATE BLOG
    @Transactional
    public Blog updateBlog(

            Long id,

            BlogRequest req,

            MultipartFile mainImage,

            MultipartFile authorPhoto

    ) throws Exception{

        Blog blog=getBlog(id);


        blog.setTitle(req.getTitle());

        blog.setSubtitle(req.getSubtitle());

        blog.setHeading(req.getHeading());

        blog.setContent(req.getContent());

        blog.setSlug(req.getSlug());

        blog.setMetaTitle(req.getMetaTitle());

        blog.setMetaDescription(req.getMetaDescription());


        blog.setAuthorName(req.getAuthorName());

        blog.setAuthorDescription(req.getAuthorDescription());


        Category category=
                categoryRepo.findById(req.getCategoryId())
                        .orElseThrow();

        blog.setCategory(category);


        // Replace Image
        if(mainImage!=null){

            deleteFile(blog.getMainImage());

            blog.setMainImage(
                    saveFile(mainImage)
            );

        }


        if(authorPhoto!=null){

            deleteFile(blog.getAuthorPhoto());

            blog.setAuthorPhoto(
                    saveFile(authorPhoto)
            );

        }


// DELETE OLD TAGS FOR BLOG
        tagRepo.deleteByBlogId(blog.getId());

        List<BlogTag> tagList = new ArrayList<>();

        for(String tagName : req.getTags()){

            BlogTag tag =
                    tagRepo.findByTagName(tagName)
                            .orElseGet(() -> {

                                BlogTag newTag = new BlogTag();
                                newTag.setTagName(tagName);

                                return newTag;
                            });

            tag.setBlog(blog);

            tagList.add(tag);
        }

        blog.setTags(tagList);


        // Replace FAQ
        // Replace FAQ (FIXED)

// DELETE OLD FAQS FROM DATABASE
        faqRepo.deleteByBlogId(blog.getId());

        List<BlogFaq> faqList = new ArrayList<>();

        for(FaqDTO f : req.getFaqs()){

            BlogFaq faq = new BlogFaq();

            faq.setQuestion(f.getQuestion());

            faq.setAnswer(f.getAnswer());

            faq.setBlog(blog);

            faqList.add(faq);
        }

        blog.setFaqs(faqList);


        return blogRepo.save(blog);

    }



    // DELETE BLOG
    public void deleteBlog(Long id){

        Blog blog=getBlog(id);

        deleteFile(blog.getMainImage());

        deleteFile(blog.getAuthorPhoto());

        blogRepo.delete(blog);

    }



    // SAVE IMAGE
    private String saveFile(
            MultipartFile file
    ) throws Exception{

        String name=
                System.currentTimeMillis()
                        +"_"
                        +file.getOriginalFilename();

        Path path=Paths.get(uploadDir,name);

        Files.copy(
                file.getInputStream(),
                path
        );

        return "/uploads/"+name;

    }


    // DELETE IMAGE
    private void deleteFile(
            String filePath
    ){

        try{

            Path path=
                    Paths.get(
                            filePath
                                    .replace("/uploads/",
                                            uploadDir)
                    );

            Files.deleteIfExists(path);

        }catch(Exception e){}

    }

}