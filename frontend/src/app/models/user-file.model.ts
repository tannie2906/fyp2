export interface UserFile {
  id: number;
  file_name: string;
  size: number;
  user_id: number;
  created_at: string;
  is_deleted: boolean;
  deleted_at?: string;
  file_path: string;
}
