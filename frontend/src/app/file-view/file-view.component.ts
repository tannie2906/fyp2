import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileService } from '../services/file.service';
import { UserFile } from '../models/user-file.model';

@Component({
  selector: 'app-file-view',
  templateUrl: './file-view.component.html',
  styleUrls: ['./file-view.component.css'],
})
export class FileViewComponent implements OnInit {
  fileName: string | null = null;
  fileUrl: string | null = null;
  files: UserFile[] = [];

  constructor(
    private route: ActivatedRoute,
    private fileService: FileService
  ) {}

  ngOnInit(): void {
    // Get route parameters
    this.route.paramMap.subscribe((params) => {
      this.fileName = params.get('fileName');
      if (this.fileName) {
        this.getFileUrl(this.fileName);
      }

      // Fetch files
      this.fileService.getFiles().subscribe(
        (fetchedFiles: UserFile[]) => {
          this.files = fetchedFiles; // Use the fetched data
        },
        (error) => {
          console.error('Error fetching files:', error);
        }
      );
    });
  }

  getFileUrl(fileName: string): void {
    this.fileService.getFileUrl(fileName).subscribe(
      (response) => {
        this.fileUrl = response.fileUrl;
      },
      (error) => {
        console.error('Error fetching file URL:', error);
      }
    );
  }

  isImage(fileUrl: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
    return imageExtensions.some((ext) => fileUrl.toLowerCase().endsWith(ext));
  }
}
