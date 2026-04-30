<?php

namespace App\Filament\Resources\DailyJobs;

use App\Filament\Resources\DailyJobs\Pages\CreateDailyJob;
use App\Filament\Resources\DailyJobs\Pages\EditDailyJob;
use App\Filament\Resources\DailyJobs\Pages\ListDailyJobs;
use App\Filament\Resources\DailyJobs\Schemas\DailyJobForm;
use App\Filament\Resources\DailyJobs\Tables\DailyJobsTable;
use App\Models\DailyJob;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class DailyJobResource extends Resource
{
    protected static ?string $model = DailyJob::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'admin';

    public static function form(Schema $schema): Schema
    {
        return DailyJobForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return DailyJobsTable::configure($table);
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
            'index' => ListDailyJobs::route('/'),
            'create' => CreateDailyJob::route('/create'),
            'edit' => EditDailyJob::route('/{record}/edit'),
        ];
    }
}
