<?php

namespace App\Filament\Resources\ComputerAssets\Pages;

use App\Filament\Resources\ComputerAssets\ComputerAssetResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListComputerAssets extends ListRecords
{
    protected static string $resource = ComputerAssetResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
