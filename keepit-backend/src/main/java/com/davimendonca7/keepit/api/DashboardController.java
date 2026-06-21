package com.davimendonca7.keepit.api;

import com.davimendonca7.keepit.domain.dashboard.DashboardService;
import com.davimendonca7.keepit.domain.dashboard.dto.DashboardResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardResponseDto> getDashboard(
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseEntity.ok(dashboardService.getDashboard(month, year));
    }
}
