<?php

namespace App\Filament\Resources\ComputerAssets\Pages;

use App\Filament\Resources\ComputerAssets\ComputerAssetResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditComputerAsset extends EditRecord
{
    protected static string $resource = ComputerAssetResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
