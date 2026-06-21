package com.davimendonca7.keepit.api;

import com.davimendonca7.keepit.domain.category.CategoryService;
import com.davimendonca7.keepit.domain.category.TransactionType;
import com.davimendonca7.keepit.domain.category.dto.CategoryRequestDto;
import com.davimendonca7.keepit.domain.category.dto.CategoryResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<CategoryResponseDto> create(@RequestBody @Valid CategoryRequestDto dto) {
        return ResponseEntity.status(201).body(categoryService.createCategory(dto));
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponseDto>> list(@RequestParam(required = false) TransactionType type) {
        return ResponseEntity.ok(categoryService.listCategories(type));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponseDto> update(@PathVariable Long id, @RequestBody @Valid CategoryRequestDto dto) {
        return ResponseEntity.ok(categoryService.updateCategory(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }
}
