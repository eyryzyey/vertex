<?php
class ChannelController
{
    private static function categories(): array
    {
        return array_values(array_filter(Category::getAll(), fn($c) => in_array($c['type'], ['channel', 'general'], true)));
    }

    public static function index(): void
    {
        view('channels/index', ['channels' => Channel::getAll()]);
    }

    public static function create(): void
    {
        view('channels/form', ['channel' => null, 'categories' => self::categories()]);
    }

    public static function edit(): void
    {
        $channel = Channel::getById((int)($_GET['id'] ?? 0));
        if (!$channel) {
            flash('Channel not found', 'danger');
            redirect('index.php?page=channels');
        }
        view('channels/form', ['channel' => $channel, 'categories' => self::categories()]);
    }

    private static function collect(array $old = null): array
    {
        $logo = handle_upload($_FILES['logo'] ?? [], 'channels', 'ch') ?? ($old['logo'] ?? null);
        return [
            'name' => trim($_POST['name'] ?? ''),
            'logo' => $logo,
            'm3u_link' => trim($_POST['m3u_link'] ?? ''),
            'category_id' => $_POST['category_id'] !== '' ? (int)$_POST['category_id'] : null,
            'status' => $_POST['status'] ?? 'active',
        ];
    }

    public static function store(): void
    {
        $d = self::collect();
        if ($d['name'] === '' || $d['m3u_link'] === '') {
            flash('Name and M3U link are required', 'danger');
            redirect('index.php?page=channels&action=create');
        }
        Channel::create($d);
        flash('Channel created successfully');
        redirect('index.php?page=channels');
    }

    public static function update(): void
    {
        $id = (int)($_POST['id'] ?? 0);
        $old = Channel::getById($id);
        if (!$old) {
            redirect('index.php?page=channels');
        }
        $d = self::collect($old);
        Channel::update($id, $d);
        flash('Channel updated successfully');
        redirect('index.php?page=channels');
    }

    public static function delete(): void
    {
        $id = (int)($_GET['id'] ?? 0);
        if ($id) {
            Channel::delete($id);
            flash('Channel deleted');
        }
        redirect('index.php?page=channels');
    }
}
