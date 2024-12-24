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
  sortOrder: { [key: string]: string } = { name: 'asc' };

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

  // Sort files by specified field
  sortFiles(field: string): void {
    const currentOrder = this.sortOrder[field];
    this.sortOrder[field] = currentOrder === 'asc' ? 'desc' : 'asc';

    this.searchResults.sort((a: any, b: any) => {
      if (this.sortOrder[field] === 'asc') {
        return a[field] > b[field] ? 1 : -1;
      } else {
        return a[field] < b[field] ? 1 : -1;
      }
    });
  }

  // Open file action
  onOpenFile(file: any, event: Event): void {
    event.preventDefault();
    console.log('Open file:', file);
  }

  // Toggle starred files
  toggleStar(file: any): void {
    file.isStarred = !file.isStarred;
    console.log('Star toggled:', file);
  }

  // ====== NEW METHODS ADDED ======

  // Format file size
  formatFileSize(size: number): string {
    if (size < 1024) return `${size} B`;
    else if (size < 1048576) return `${(size / 1024).toFixed(1)} KB`;
    else if (size < 1073741824) return `${(size / 1048576).toFixed(1)} MB`;
    else return `${(size / 1073741824).toFixed(1)} GB`;
  }

  // Handle actions for dropdown menu
  toggleDropdown(file: any): void {
    file.showDropdown = !file.showDropdown;
  }

  onRename(file: any): void {
    console.log('Rename file:', file);
  }

  onMove(file: any): void {
    console.log('Move file:', file);
  }

  onShare(file: any): void {
    console.log('Share file:', file);
  }

  onDownload(file: any, event: Event): void {
    event.stopPropagation();
    console.log('Download file:', file);
  }

  onDelete(file: any, event: Event): void {
    event.stopPropagation();
    console.log('Delete file:', file);
  }
}
