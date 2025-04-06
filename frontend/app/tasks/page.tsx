'use client';

import { useState, useEffect } from 'react';
import { useTaskStore } from '@/lib/store';
import { Task, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { PlusCircle, CheckCircle, Circle, Clock, AlertCircle, Trash2, Calendar as CalendarIcon, Tag, Search, Filter, SortAsc, MoreVertical, ChevronDown, ChevronRight } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function Tasks() {
  const { tasks, categories, searchQuery, addTask, updateTask, deleteTask, addCategory, setSearchQuery, getFilteredTasks } = useTaskStore();
  const [newTask, setNewTask] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('none');
  const [selectedPriority, setSelectedPriority] = useState<Task['priority']>('medium');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [description, setDescription] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [view, setView] = useState('list');
  const [sortBy, setSortBy] = useState('date');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredTasks = getFilteredTasks();
  
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    pending: tasks.filter(t => t.status === 'pending').length,
  };

  function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const task: Task = {
        id: crypto.randomUUID(),
        title: newTask,
        description,
        status: 'pending',
        priority: selectedPriority,
        categoryId: selectedCategory === 'none' ? undefined : selectedCategory,
        dueDate: selectedDate?.toISOString(),
        userId: 'local-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addTask(task);
      setNewTask('');
      setDescription('');
      setSelectedDate(undefined);
      toast.success('Tarefa adicionada com sucesso');
    } catch (error) {
      toast.error('Erro ao adicionar tarefa');
    }
  }

  function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      const category: Category = {
        id: crypto.randomUUID(),
        name: newCategory,
        userId: 'local-user',
        createdAt: new Date().toISOString(),
      };

      addCategory(category);
      setNewCategory('');
      toast.success('Categoria adicionada com sucesso');
    } catch (error) {
      toast.error('Erro ao adicionar categoria');
    }
  }

  function handleUpdateStatus(taskId: string, status: Task['status']) {
    try {
      updateTask(taskId, { 
        status,
        updatedAt: new Date().toISOString()
      });
      toast.success('Tarefa atualizada com sucesso');
    } catch (error) {
      toast.error('Erro ao atualizar tarefa');
    }
  }

  function handleDeleteTask(taskId: string) {
    try {
      deleteTask(taskId);
      toast.success('Tarefa excluída com sucesso');
    } catch (error) {
      toast.error('Erro ao excluir tarefa');
    }
  }

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <Card key={task.id} className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            const nextStatus = {
              pending: 'in-progress',
              'in-progress': 'completed',
              completed: 'pending',
            }[task.status] as Task['status'];
            handleUpdateStatus(task.id, nextStatus);
          }}
          className="hover:opacity-80 transition-opacity"
        >
          {getStatusIcon(task.status)}
        </button>
        <div className="flex-1">
          <h3 className="font-medium">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-muted-foreground">{task.description}</p>
          )}
          <div className="flex gap-2 mt-2 text-sm text-muted-foreground">
            {task.categoryId && (
              <span className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                {categories.find(c => c.id === task.categoryId)?.name}
              </span>
            )}
            {task.dueDate && (
              <span className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                {format(new Date(task.dueDate), 'PP')}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getPriorityIcon(task.priority)}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDeleteTask(task.id)}>
                <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {isClient && (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-4xl font-bold">Tarefas</h1>
                <div className="flex items-center gap-4">
                  <Tabs value={view} onValueChange={setView}>
                    <TabsList>
                      <TabsTrigger value="list">Lista</TabsTrigger>
                      <TabsTrigger value="board">Quadro</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <SortAsc className="h-4 w-4 mr-2" />
                        Ordenar
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setSortBy('date')}>
                        Data
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('priority')}>
                        Prioridade
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy('status')}>
                        Status
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Quick Add Task */}
              <form onSubmit={handleAddTask} className="mb-8">
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Adicionar nova tarefa..."
                    className="flex-1"
                  />
                  <Button type="submit">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </form>

              {/* Task List */}
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
} 