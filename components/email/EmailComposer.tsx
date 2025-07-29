'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmailAccount } from '@/types';
import { emailComposeSchema } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Send,
  X,
  Paperclip,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Link,
  Image,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { toast } from 'sonner';
import { EmailAPIService } from '@/lib/services/email.service';

interface EmailComposerProps {
  currentAccount: EmailAccount;
  onClose: () => void;
  onSent: () => void;
  replyTo?: {
    messageId: string;
    subject: string;
    fromAddress: string;
    body: string;
  };
}

export function EmailComposer({
  currentAccount,
  onClose,
  onSent,
  replyTo
}: EmailComposerProps) {
  const [loading, setLoading] = useState(false);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: zodResolver(emailComposeSchema),
    defaultValues: {
      to: '',
      cc: '',
      bcc: '',
      subject: replyTo ? `Re: ${replyTo.subject}` : '',
      body: replyTo ? `\n\n--- Orijinal Mesaj ---\n${replyTo.body}` : ''
    }
  });

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);

      // Parse email addresses
      const toEmails = data.to.split(',').map((email: string) => email.trim()).filter(Boolean);
      const ccEmails = data.cc ? data.cc.split(',').map((email: string) => email.trim()).filter(Boolean) : [];
      const bccEmails = data.bcc ? data.bcc.split(',').map((email: string) => email.trim()).filter(Boolean) : [];

      // Validate email addresses
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const allEmails = [...toEmails, ...ccEmails, ...bccEmails];

      for (const email of allEmails) {
        if (!emailRegex.test(email)) {
          toast.error(`Geçersiz e-posta adresi: ${email}`);
          return;
        }
      }

      if (toEmails.length === 0) {
        toast.error('En az bir alıcı adresi gereklidir');
        return;
      }

      const emailData = {
        fromAccountId: currentAccount.id, // Mevcut hesabı kullan
        to: toEmails,
        cc: ccEmails,
        bcc: bccEmails,
        subject: data.subject,
        body: data.body,
        attachments: []
      };

      // Send email using EmailAPIService
      const response = await EmailAPIService.sendEmail(emailData);

      if (response.success) {
        toast.success('E-posta başarıyla gönderildi!');
        onSent();
        onClose();
      } else {
        toast.error(response.message || 'E-posta gönderilemedi');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('E-posta gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 w-80 bg-card border rounded-lg shadow-lg">
        <div className="p-3 border-b flex items-center justify-between">
          <span className="text-sm font-medium">Yeni E-posta</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setIsMinimized(false)}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="p-3">
          <div className="text-sm text-muted-foreground">
            Kime: {watch('to') || 'Alıcı belirtilmedi'}
          </div>
          <div className="text-sm text-muted-foreground">
            Konu: {watch('subject') || 'Konu yok'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-card flex flex-col max-h-screen">
      {/* Header */}
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Yeni E-posta</h2>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setIsMinimized(true)}>
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
        <div className="p-4 space-y-4">
          {/* From - Otomatik doldurulur, değiştirilemez */}
          <div className="flex items-center gap-4">
            <Label className="w-16 text-right">Kimden:</Label>
            <div className="flex-1 text-sm text-muted-foreground">
              {currentAccount.email}
            </div>
          </div>

          {/* To */}
          <div className="flex items-center gap-4">
            <Label className="w-16 text-right">Kime:</Label>
            <div className="flex-1">
              <Input
                {...register('to')}
                placeholder="E-posta adreslerini virgülle ayırın"
                className="border-0 shadow-none focus-visible:ring-0 px-0 bg-transparent"
                style={{
                  WebkitBoxShadow: '0 0 0 1000px white inset',
                  WebkitTextFillColor: 'inherit'
                }}
                autoComplete="off"
              />
              {errors.to && (
                <p className="text-sm text-red-600 mt-1">{errors.to.message}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowCc(!showCc)}
                className="text-xs"
              >
                CC
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowBcc(!showBcc)}
                className="text-xs"
              >
                BCC
              </Button>
            </div>
          </div>

          {/* CC */}
          {showCc && (
            <div className="flex items-center gap-4">
              <Label className="w-16 text-right">CC:</Label>
              <Input
                {...register('cc')}
                placeholder="E-posta adreslerini virgülle ayırın"
                className="border-0 shadow-none focus-visible:ring-0 px-0 bg-transparent"
                style={{
                  WebkitBoxShadow: '0 0 0 1000px white inset',
                  WebkitTextFillColor: 'inherit'
                }}
                autoComplete="off"
              />
            </div>
          )}

          {/* BCC */}
          {showBcc && (
            <div className="flex items-center gap-4">
              <Label className="w-16 text-right">BCC:</Label>
              <Input
                {...register('bcc')}
                placeholder="E-posta adreslerini virgülle ayırın"
                className="border-0 shadow-none focus-visible:ring-0 px-0 bg-transparent"
                style={{
                  WebkitBoxShadow: '0 0 0 1000px white inset',
                  WebkitTextFillColor: 'inherit'
                }}
                autoComplete="off"
              />
            </div>
          )}

          {/* Subject */}
          <div className="flex items-center gap-4">
            <Label className="w-16 text-right">Konu:</Label>
            <Input
              {...register('subject')}
              placeholder="E-posta konusu"
              className="border-0 shadow-none focus-visible:ring-0 px-0 bg-transparent"
              style={{
                WebkitBoxShadow: '0 0 0 1000px white inset',
                WebkitTextFillColor: 'inherit'
              }}
              autoComplete="off"
            />
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="flex items-start gap-4">
              <Label className="w-16 text-right">Ekler:</Label>
              <div className="flex-1 space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({Math.round(file.size / 1024)} KB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Toolbar */}
        <div className="p-2 border-b">
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="sm">
              <Bold className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm">
              <Italic className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm">
              <Underline className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Button type="button" variant="ghost" size="sm">
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm">
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm">
              <AlignRight className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Button type="button" variant="ghost" size="sm">
              <List className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm">
              <Link className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm">
              <Image className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <input
              type="file"
              multiple
              onChange={handleAttachment}
              className="hidden"
              id="attachment-input"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => document.getElementById('attachment-input')?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  Gönder
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Message Body */}
        <div className="flex-1 p-4 overflow-hidden">
          <Textarea
            {...register('body')}
            placeholder="Mesajınızı yazın..."
            className="h-full w-full border-0 shadow-none focus-visible:ring-0 resize-none"
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex-shrink-0 bg-white">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Ctrl+Enter ile gönder
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                İptal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Gönder
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}