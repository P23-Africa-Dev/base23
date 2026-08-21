<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable([
    'name',
    'email',
    'password',
    'account_type',
    'company_name',
    'company_description',
    'website',
    'industry',
    'categories',
    'great_at',
    'can_help_with',
    'phone',
    'linkedin',
    'country',
    'countries_of_operation',
    'position',
    'role',
    'years_of_operation',
    'number_of_employees',
    'business_based',
    'hiring_field_sales',
    'budget_per_hire',
    'selected_outcome',
    'goals',
    'year_established',
    'tier',
    'profile_picture',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'categories' => 'array',
            'great_at' => 'array',
            'can_help_with' => 'array',
            'countries_of_operation' => 'array',
        ];
    }
}
