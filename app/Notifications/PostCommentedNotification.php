<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PostCommentedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $postId,
        public string $postTitle,
        public string $commenterName,
        public string $commentPreview
    ) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

        public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("New comment: {$this->postTitle}")
            ->greeting("Hi {$notifiable->name}!")
            ->line("{$this->commenterName} commented on your post:")
            ->line("\"{$this->commentPreview}\"")
            ->action('Open post', url("/posts/{$this->postId}"))
            ->line("If this wasn't you, you can ignore this email.")
            ->salutation('-- Car Forum');
    }

}   
