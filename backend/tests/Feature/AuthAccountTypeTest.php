<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthAccountTypeTest extends TestCase
{
    use RefreshDatabase;

    public function test_company_can_register_and_is_authenticated(): void
    {
        $response = $this->postJson('/register', [
            'name' => 'Hiring Lead',
            'email' => 'hirer@example.com',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
            'account_type' => 'company',
            'company_name' => 'Acme Hiring',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.account_type', 'company')
            ->assertJsonPath('user.email', 'hirer@example.com');

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', [
            'email' => 'hirer@example.com',
            'account_type' => 'company',
        ]);
    }

    public function test_agent_can_register_and_is_authenticated(): void
    {
        $response = $this->postJson('/register', [
            'name' => 'Sales Agent',
            'email' => 'agent@example.com',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
            'account_type' => 'agent',
            'company_name' => 'Agent Co',
            'role' => 'Field Sales Agent',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.account_type', 'agent');

        $this->assertAuthenticated();
    }

    public function test_login_rejects_wrong_account_type_door(): void
    {
        $user = User::factory()->create([
            'email' => 'agent-door@example.com',
            'password' => 'Password1!',
            'account_type' => 'agent',
        ]);

        $response = $this->postJson('/login', [
            'email' => $user->email,
            'password' => 'Password1!',
            'account_type' => 'company',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('actual_account_type', 'agent')
            ->assertJsonPath('expected_account_type', 'company');

        $this->assertGuest();
    }

    public function test_login_succeeds_when_account_type_matches(): void
    {
        $user = User::factory()->create([
            'email' => 'company-door@example.com',
            'password' => 'Password1!',
            'account_type' => 'company',
        ]);

        $response = $this->postJson('/login', [
            'email' => $user->email,
            'password' => 'Password1!',
            'account_type' => 'company',
        ]);

        $response->assertOk()->assertJsonPath('success', true);
        $this->assertAuthenticated();
    }

    public function test_register_requires_account_type(): void
    {
        $response = $this->postJson('/register', [
            'name' => 'No Type',
            'email' => 'notype@example.com',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
        ]);

        $response->assertStatus(422);
    }
}
