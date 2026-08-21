<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            
            // Rebrand / Profile Fields
            $table->string('account_type')->default('agent');
            $table->string('company_name')->nullable();
            $table->text('company_description')->nullable();
            $table->string('website')->nullable();
            $table->string('industry')->nullable();
            $table->json('categories')->nullable();
            $table->json('great_at')->nullable();
            $table->json('can_help_with')->nullable();
            $table->string('phone')->nullable();
            $table->string('linkedin')->nullable();
            $table->string('country')->nullable();
            $table->json('countries_of_operation')->nullable();
            $table->string('position')->nullable();
            $table->string('role')->nullable();
            $table->string('years_of_operation')->nullable();
            $table->string('number_of_employees')->nullable();
            $table->string('business_based')->nullable();
            $table->string('hiring_field_sales')->nullable();
            $table->string('budget_per_hire')->nullable();
            $table->string('selected_outcome')->nullable();
            $table->text('goals')->nullable();
            $table->string('year_established')->nullable();
            $table->string('tier')->nullable();
            $table->string('profile_picture')->nullable();

            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
