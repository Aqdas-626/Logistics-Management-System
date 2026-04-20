<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class VerifyEmailController extends Controller
{
    /**
     * Mark the user's email address as verified.
     */
    public function __invoke(Request $request, int|string $id, string $hash): RedirectResponse
    {
        $user = User::query()->findOrFail($id);

        if (! hash_equals(sha1((string) $user->getEmailForVerification()), (string) $hash)) {
            abort(403);
        }

        if ($user->hasVerifiedEmail()) {
            return redirect()->route('login')->with('status', 'Email already verified. You can login now.');
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return redirect()->route('login')->with('status', 'Email verified successfully. You can login now.');
    }
}
