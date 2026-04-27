export class CommentResponseDto {
  id: string;
  taskId: string;
  userId: string;
  userFirstName?: string;
  userLastName?: string;
  userEmail?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
