<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PostDeletedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $postTitle,
        public ?string $reason = null
    ) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject('Your post was removed')
            ->greeting("Hi {$notifiable->name},")
            ->line("Your post “{$this->postTitle}” was removed by moderation.");

        if ($this->reason) {
            $mail->line("Reason: {$this->reason}");
        }

        return $mail->line('If you think this is a mistake, contact support.')
                    ->line('— Car Forum');
    }
}
