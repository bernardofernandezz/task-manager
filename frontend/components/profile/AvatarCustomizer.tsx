import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface AvatarCustomizerProps {
  userId: string;
  currentAvatar?: string;
  onAvatarUpdate: (url: string) => void;
}

const AVATAR_STYLES = [
  { id: 'default', name: 'Padrão', color: 'bg-blue-500' },
  { id: 'green', name: 'Verde', color: 'bg-green-500' },
  { id: 'purple', name: 'Roxo', color: 'bg-purple-500' },
  { id: 'orange', name: 'Laranja', color: 'bg-orange-500' },
  { id: 'pink', name: 'Rosa', color: 'bg-pink-500' },
];

export function AvatarCustomizer({ userId, currentAvatar, onAvatarUpdate }: AvatarCustomizerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('default');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      onAvatarUpdate(publicUrl);
      toast.success('Foto de perfil atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      toast.error('Erro ao atualizar foto de perfil');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Personalizar Avatar</h2>
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <Avatar className="w-32 h-32">
            <AvatarImage src={currentAvatar} />
            <AvatarFallback className={`text-4xl ${AVATAR_STYLES.find(s => s.id === selectedStyle)?.color}`}>
              {userId.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            size="icon"
            className="absolute bottom-0 right-0 rounded-full"
            onClick={() => document.getElementById('avatar-upload')?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </Button>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>

        <div className="w-full">
          <h3 className="text-sm font-medium mb-2">Estilo do Avatar</h3>
          <div className="grid grid-cols-5 gap-2">
            {AVATAR_STYLES.map((style) => (
              <Button
                key={style.id}
                variant={selectedStyle === style.id ? 'default' : 'outline'}
                className={`h-10 w-10 rounded-full p-0 ${style.color}`}
                onClick={() => setSelectedStyle(style.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
} 