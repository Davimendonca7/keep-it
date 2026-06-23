package com.davimendonca7.keepit.domain.category;

import com.davimendonca7.keepit.domain.category.dto.CategoryRequestDto;
import com.davimendonca7.keepit.domain.category.dto.CategoryResponseDto;
import com.davimendonca7.keepit.domain.transaction.TransactionRepository;
import com.davimendonca7.keepit.domain.transaction.recurring_transaction.RecurringTransactionRepository;
import com.davimendonca7.keepit.domain.user.User;
import com.davimendonca7.keepit.domain.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final RecurringTransactionRepository recurringTransactionRepository;
    private final UserService userService;

    public CategoryResponseDto createCategory(CategoryRequestDto dto) {
        User user = userService.getAuthenticatedUser();
        Category category = Category.builder()
                .name(dto.name())
                .type(dto.type())
                .user(user)
                .build();
        return new CategoryResponseDto(categoryRepository.save(category));
    }

    public List<CategoryResponseDto> listCategories(TransactionType type) {
        String username = UserService.getAuthenticatedUsername();
        System.out.println(username);

        List<Category> categories =
//                type != null
//                ? categoryRepository.findAllByUserUsernameAndType(username, type)
//                :
                categoryRepository.findAllByUserEmail(username);
        System.out.println(categories);

        return categories.stream().map(CategoryResponseDto::new).toList();
    }

    public CategoryResponseDto updateCategory(Long id, CategoryRequestDto dto) {
        String username = UserService.getAuthenticatedUsername();
        Category category = categoryRepository.findByIdAndUserEmail(id, username)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
        category.setName(dto.name());
        category.setType(dto.type());
        return new CategoryResponseDto(categoryRepository.save(category));
    }

    public void deleteCategory(Long id) {
        String username = UserService.getAuthenticatedUsername();
        Category category = categoryRepository.findByIdAndUserEmail(id, username)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
        if (transactionRepository.existsByCategoryId(id) || recurringTransactionRepository.existsByCategoryId(id)) {
            throw new RuntimeException("Categoria possui transações vinculadas e não pode ser excluída");
        }
        categoryRepository.delete(category);
    }
}
