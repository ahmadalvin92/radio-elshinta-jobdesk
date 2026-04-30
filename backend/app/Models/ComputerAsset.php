<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComputerAsset extends Model
{
    protected $fillable = [
        'pc_name',
        'ip_address',
        'windows_version',
        'processor',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
        ];
    }

    public function dailyJobs()
    {
        return $this->hasMany(DailyJob::class);
    }
}
