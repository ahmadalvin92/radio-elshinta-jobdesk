<?php

namespace App\Filament\Resources\DailyJobs\Pages;

use App\Filament\Resources\DailyJobs\DailyJobResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListDailyJobs extends ListRecords
{
    protected static string $resource = DailyJobResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
