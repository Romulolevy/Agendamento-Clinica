"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Notification, NotificationType, NotificationStatus } from "@/lib/models/Notification";
import { NotificationService } from "@/lib/services/NotificationService";
import { useNotifications } from "@/lib/contexts/NotificationContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Bell,
  Calendar,
  AlertCircle,
  Info,
  CheckCircle,
  Trash2,
  Check,
  CheckCheck,
} from "lucide-react";

export default function NotificacoesPage() {
  const { refreshNotifications } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedTab, setSelectedTab] = useState<"all" | "unread">("all");
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);

  const loadNotifications = () => {
    const service = NotificationService.getInstance();
    setNotifications(service.getAll());
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const getIcon = (type: NotificationType) => {
    const icons: Record<NotificationType, React.ReactNode> = {
      [NotificationType.APPOINTMENT_REMINDER]: <Calendar className="h-5 w-5 text-blue-500" />,
      [NotificationType.APPOINTMENT_CONFIRMATION]: <CheckCircle className="h-5 w-5 text-green-500" />,
      [NotificationType.APPOINTMENT_CANCELLATION]: <AlertCircle className="h-5 w-5 text-red-500" />,
      [NotificationType.SYSTEM]: <Info className="h-5 w-5 text-gray-500" />,
      [NotificationType.GENERAL]: <Bell className="h-5 w-5 text-primary" />,
    };
    return icons[type];
  };

  const getTypeLabel = (type: NotificationType) => {
    const labels: Record<NotificationType, string> = {
      [NotificationType.APPOINTMENT_REMINDER]: "Lembrete",
      [NotificationType.APPOINTMENT_CONFIRMATION]: "Confirmação",
      [NotificationType.APPOINTMENT_CANCELLATION]: "Cancelamento",
      [NotificationType.SYSTEM]: "Sistema",
      [NotificationType.GENERAL]: "Geral",
    };
    return labels[type];
  };

  const filteredNotifications = notifications.filter((n) => {
    if (selectedTab === "unread") {
      return n.getStatus() !== NotificationStatus.READ;
    }
    return true;
  });

  const unreadCount = notifications.filter(
    (n) => n.getStatus() !== NotificationStatus.READ
  ).length;

  const handleMarkAsRead = (notification: Notification) => {
    const service = NotificationService.getInstance();
    notification.markAsRead();
    service.update(notification);
    loadNotifications();
    refreshNotifications();
  };

  const handleMarkAllAsRead = () => {
    const service = NotificationService.getInstance();
    notifications.forEach((n) => {
      if (n.getStatus() !== NotificationStatus.READ) {
        n.markAsRead();
        service.update(n);
      }
    });
    loadNotifications();
    refreshNotifications();
    toast.success("Todas as notificações foram marcadas como lidas!");
  };

  const handleDelete = (id: string) => {
    const service = NotificationService.getInstance();
    service.delete(id);
    loadNotifications();
    refreshNotifications();
    toast.success("Notificação excluída!");
  };

  const handleDeleteAll = () => {
    const service = NotificationService.getInstance();
    notifications.forEach((n) => service.delete(n.getId()));
    loadNotifications();
    refreshNotifications();
    setShowDeleteAllDialog(false);
    toast.success("Todas as notificações foram excluídas!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Notificações</h1>
          <p className="text-muted-foreground">
            Gerencie suas notificações e lembretes
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Marcar todas como lidas
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="destructive" onClick={() => setShowDeleteAllDialog(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Limpar todas
            </Button>
          )}
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as "all" | "unread")}>
        <TabsList>
          <TabsTrigger value="all">
            Todas ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Não lidas ({unreadCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedTab === "all" ? "Todas as Notificações" : "Notificações Não Lidas"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    {selectedTab === "all"
                      ? "Você não tem notificações"
                      : "Você não tem notificações não lidas"}
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {filteredNotifications
                      .sort((a, b) => b.getCreatedAt().getTime() - a.getCreatedAt().getTime())
                      .map((notification) => {
                        const isUnread = notification.getStatus() !== NotificationStatus.READ;

                        return (
                          <div
                            key={notification.getId()}
                            className={`
                              flex items-start gap-4 p-4 rounded-lg border transition-colors
                              ${isUnread ? "bg-primary/5 border-primary/20" : "bg-card"}
                            `}
                          >
                            <div className="flex-shrink-0 mt-1">
                              {getIcon(notification.getType())}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm truncate">
                                  {notification.getTitle()}
                                </h4>
                                {isUnread && (
                                  <Badge variant="default" className="text-xs">
                                    Nova
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {getTypeLabel(notification.getType())}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {notification.getMessage()}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {format(notification.getCreatedAt(), "dd 'de' MMMM 'às' HH:mm", {
                                  locale: ptBR,
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {isUnread && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleMarkAsRead(notification)}
                                  title="Marcar como lida"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(notification.getId())}
                                title="Excluir"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar todas as notificações</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir todas as notificações? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              className="bg-destructive text-destructive-foreground"
            >
              Excluir todas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
