<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class JobDispatchedNotification extends Notification
{
    public function __construct(
        public readonly string $jobTypeLabel,
        public readonly ?string $jobNumber,
        public readonly ?string $containerNumber,
        public readonly ?string $notes,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $jobNumber = $this->jobNumber ?: '—';
        $containerNumber = $this->containerNumber ?: '—';

        $mail = (new MailMessage)
            ->subject('Job Dispatched: '.$jobNumber)
            ->greeting('Hello '.$notifiable->name.',')
            ->line('A job has been dispatched to you.')
            ->line('Job Type: '.$this->jobTypeLabel)
            ->line('Job Number: '.$jobNumber)
            ->line('Container Number: '.$containerNumber);

        if ($this->notes) {
            $mail->line('Notes: '.$this->notes);
        }

        return $mail->line('Please login to the system for more details.');
    }
}

