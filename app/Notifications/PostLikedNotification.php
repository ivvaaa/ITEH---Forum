<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PostLikedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $postId,
        public string $postTitle,
        public string $likerName
    ) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Someone liked your post')
            ->greeting("Hi {$notifiable->name}!")
            ->line("{$this->likerName} liked your post: “{$this->postTitle}”.")
            ->action('View post', url("/posts/{$this->postId}"))
            ->line('— Car Forum');
    }
}
