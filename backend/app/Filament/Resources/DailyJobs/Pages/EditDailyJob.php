<?php

namespace App\Filament\Resources\DailyJobs\Pages;

use App\Filament\Resources\DailyJobs\DailyJobResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditDailyJob extends EditRecord
{
    protected static string $resource = DailyJobResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
