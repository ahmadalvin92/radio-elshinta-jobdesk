<?php

namespace App\Filament\Resources\ComputerAssets;

use App\Filament\Resources\ComputerAssets\Pages\CreateComputerAsset;
use App\Filament\Resources\ComputerAssets\Pages\EditComputerAsset;
use App\Filament\Resources\ComputerAssets\Pages\ListComputerAssets;
use App\Filament\Resources\ComputerAssets\Schemas\ComputerAssetForm;
use App\Filament\Resources\ComputerAssets\Tables\ComputerAssetsTable;
use App\Models\ComputerAsset;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class ComputerAssetResource extends Resource
{
    protected static ?string $model = ComputerAsset::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'admin';

    public static function form(Schema $schema): Schema
    {
        return ComputerAssetForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return ComputerAssetsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListComputerAssets::route('/'),
            'create' => CreateComputerAsset::route('/create'),
            'edit' => EditComputerAsset::route('/{record}/edit'),
        ];
    }
}
