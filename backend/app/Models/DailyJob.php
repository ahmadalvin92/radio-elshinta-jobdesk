<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyJob extends Model
{
    protected $fillable = [
        'job_date',
        'day_name',
        'start_time',
        'end_time',
        'computer_asset_id',
        'admin_id',
        'approved_by',
        'work_type',
        'description',
        'status',
        'approved_at',
        'rejected_reason',
    ];

    protected function casts(): array
    {
        return [
            'job_date' => 'date',
            'approved_at' => 'datetime',
        ];
    }

    public function computerAsset()
    {
        return $this->belongsTo(ComputerAsset::class);
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
