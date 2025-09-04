<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * GET /api/users
     * List users with their role (lean payload).
     */
    public function index()
    {
        return User::with(['role:id,name'])
            ->select('id', 'name', 'email', 'role_id')
            ->orderBy('id')
            ->get();
    }

    /**
     * GET /api/users/search
     * Supported filters:
     *  - q      : free text across name/email
     *  - name   : partial match on name
     *  - email  : partial match on email
     *  - role   : role name (e.g. admin/user/viewer), partial match allowed
     *  - page, per_page: pagination controls
     */
    public function search(Request $request)
    {
        $data = $request->validate([
            'q'        => ['sometimes', 'string', 'max:255'],
            'name'     => ['sometimes', 'string', 'max:255'],
            'email'    => ['sometimes', 'string', 'max:255'],
            'role'     => ['sometimes', 'string', 'max:100'],
            'page'     => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        if (!$request->hasAny(['q', 'name', 'email', 'role'])) {
            return response()->json([
                'message' => 'Provide at least one filter: q, name, email, or role.'
            ], 422);
        }

        // LIKE helper that escapes wildcards
        $like = function (string $term) {
            $escaped = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $term);
            return "%{$escaped}%";
        };

        $perPage = $data['per_page'] ?? 15;

        $query = User::query()
            ->with(['role:id,name'])
            ->select('id', 'name', 'email', 'role_id')
            ->when(isset($data['q']), function ($q) use ($data, $like) {
                $needle = $like($data['q']);
                $q->where(function ($qq) use ($needle) {
                    $qq->where('name', 'like', $needle)
                       ->orWhere('email', 'like', $needle);
                });
            })
            ->when(isset($data['name']), function ($q) use ($data, $like) {
                $q->where('name', 'like', $like($data['name']));
            })
            ->when(isset($data['email']), function ($q) use ($data, $like) {
                $q->where('email', 'like', $like($data['email']));
            })
            ->when(isset($data['role']), function ($q) use ($data, $like) {
                $q->whereHas('role', function ($rq) use ($data, $like) {
                    $rq->where('name', 'like', $like($data['role']));
                });
            })
            ->orderBy('id');

        // Return paginated JSON (includes meta: current_page, total, etc.)
        return $query->paginate($perPage);
    }

    /**
     * PUT /api/users/{id}/role
     * Single-role model: updates users.role_id to a valid Role id.
     * Body: { "role_id": <int> }
     */
    public function updateRole(Request $request, $id)
    {
        $payload = $request->validate([
            'role_id' => ['required', 'integer', 'exists:roles,id'],
        ]);

        $user = User::findOrFail($id);
        $user->role_id = $payload['role_id'];
        $user->save();

        // Return lean payload
        return response()->json($user->only('id', 'name', 'email', 'role_id'));
    }

    /**
     * POST /api/users/{id}/assign-role
     * Not supported in single-role model. Keep the route for compatibility,
     * but return a clear message.
     */
    public function assignRole(Request $request, $id)
    {
        return response()->json([
            'message' => 'Not supported in single-role model. Use PUT /api/users/{id}/role.'
        ], 400);
    }

}