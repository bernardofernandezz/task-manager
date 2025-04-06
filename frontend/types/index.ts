export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  categoryId?: string;
}

export interface Category {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
}