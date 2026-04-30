<?php

namespace App\Filament\Resources\DailyJobs\Pages;

use App\Filament\Resources\DailyJobs\DailyJobResource;
use Filament\Resources\Pages\CreateRecord;

class CreateDailyJob extends CreateRecord
{
    protected static string $resource = DailyJobResource::class;
}
