"use client";

import { useState } from 'react';
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
import { PlusCircle, CheckCircle, Circle, Clock, AlertCircle, Trash2, Calendar as CalendarIcon, Tag, Search, List, ArrowRight } from 'lucide-react';
import { motion } from "framer-motion";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">TaskMaster</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/signin">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signin">Começar Agora</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Foque melhor e alcance{" "}
              <span className="text-primary">progresso diário</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Tome controle dos seus dias trabalhando com propósito. Nossa plataforma
              oferece as ferramentas necessárias para organizar e progredir em suas
              metas diárias.
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link href="/auth/signin">
                  Comece Gratuitamente
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline">
                Saiba Mais
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8">
              <div className="bg-card rounded-xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Modo Foco</span>
                  </div>
                  <span className="text-3xl font-bold">60:00</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Completar apresentação</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <List className="h-5 w-5 text-blue-500" />
                    <span>Revisar documentação</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="absolute -top-8 right-12 bg-primary/20 backdrop-blur-sm rounded-lg p-4"
            >
              <CheckCircle className="h-6 w-6 text-primary" />
            </motion.div>
            <motion.div
              animate={{
                y: [0, 10, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="absolute -bottom-8 left-12 bg-secondary/20 backdrop-blur-sm rounded-lg p-4"
            >
              <List className="h-6 w-6 text-secondary" />
            </motion.div>
          </motion.div>
        </div>

        {/* Features Section */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-xl p-6"
          >
            <Clock className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Gestão de Tempo</h3>
            <p className="text-muted-foreground">
              Use nosso timer pomodoro para manter o foco e aumentar sua produtividade.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card rounded-xl p-6"
          >
            <List className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Organização</h3>
            <p className="text-muted-foreground">
              Mantenha suas tarefas organizadas e acompanhe seu progresso facilmente.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card rounded-xl p-6"
          >
            <CheckCircle className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Produtividade</h3>
            <p className="text-muted-foreground">
              Alcance suas metas diárias com nossa metodologia comprovada.
            </p>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span className="font-semibold">TaskMaster</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 TaskMaster. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}