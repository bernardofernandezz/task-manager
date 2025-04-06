"use client";

import { useState, useEffect } from 'react';
import { useTaskStore } from '@/lib/store';
import { Task, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { PlusCircle, CheckCircle, Circle, Clock, AlertCircle, Trash2, Calendar as CalendarIcon, Tag, Search, BarChart2, TrendingUp, Target, Award, ChevronRight } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';

export default function Dashboard() {
  const { tasks, categories, searchQuery, addTask, updateTask, deleteTask, addCategory, setSearchQuery, getFilteredTasks } = useTaskStore();
  const [isClient, setIsClient] = useState(false);
  const [selectedView, setSelectedView] = useState('overview');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredTasks = getFilteredTasks();
  
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    completionRate: tasks.length > 0 ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 : 0,
    highPriority: tasks.filter(t => t.priority === 'high').length,
    dueToday: tasks.filter(t => {
      const today = new Date();
      const dueDate = new Date(t.dueDate || '');
      return dueDate.toDateString() === today.toDateString();
    }).length,
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
          <button
            onClick={() => handleDeleteTask(task.id)}
            className="text-destructive hover:opacity-80 transition-opacity"
            title="Excluir tarefa"
            aria-label="Excluir tarefa"
          >
            <Trash2 className="h-5 w-5" />
          </button>
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
                <h1 className="text-4xl font-bold">Dashboard</h1>
                <Tabs value={selectedView} onValueChange={setSelectedView}>
                  <TabsList>
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="tasks">Tarefas</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <BarChart2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                      <h3 className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</h3>
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-500/10 rounded-full">
                      <TrendingUp className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Em Progresso</p>
                      <h3 className="text-2xl font-bold">{stats.inProgress}</h3>
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 rounded-full">
                      <Target className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Prioridade Alta</p>
                      <h3 className="text-2xl font-bold">{stats.highPriority}</h3>
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-full">
                      <Award className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Vencem Hoje</p>
                      <h3 className="text-2xl font-bold">{stats.dueToday}</h3>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Adicionar Tarefa</h3>
                      <p className="text-sm text-muted-foreground">Criar uma nova tarefa</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Card>
                <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Nova Categoria</h3>
                      <p className="text-sm text-muted-foreground">Organizar suas tarefas</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Card>
                <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Ver Calendário</h3>
                      <p className="text-sm text-muted-foreground">Visualizar prazos</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Card>
              </div>

              {/* Recent Tasks */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4">Tarefas Recentes</h2>
                {filteredTasks.slice(0, 5).map((task) => (
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