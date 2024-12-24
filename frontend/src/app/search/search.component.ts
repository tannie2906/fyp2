import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  query: string = '';
  searchResults: any[] = [];
  totalPages: number = 0;
  currentPage: number = 1;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get query and page number from URL parameters
    this.route.queryParams.subscribe((params) => {
      this.query = params['q'] || '';
      this.currentPage = +params['page'] || 1;
      if (this.query) {
        this.fetchSearchResults(this.query, this.currentPage);
      }
    });
  }

  // Fetch search results
  fetchSearchResults(query: string, page: number): void {
    this.apiService.getSearchResults(query, page).subscribe(
      (response: any) => {
        this.searchResults = response.results || []; // Paginated data
        this.totalPages = Math.ceil(response.count / 10); // Calculate total pages based on page size
        this.currentPage = page;
      },
      (error: any) => {
        console.error('Search error:', error);
        this.searchResults = [];
      }
    );
  }

  // Pagination: Go to the next page
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.navigateToPage(this.currentPage + 1);
    }
  }

  // Pagination: Go to the previous page
  prevPage(): void {
    if (this.currentPage > 1) {
      this.navigateToPage(this.currentPage - 1);
    }
  }

  // Navigate to a specific page
  navigateToPage(page: number): void {
    this.router.navigate(['/search'], {
      queryParams: { q: this.query, page: page },
    });
  }
}
