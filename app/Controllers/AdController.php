cccc
<?php
class AdController
{
    public const NETWORKS = ['admob', 'applovin', 'startapp', 'unity'];

    public static function index(): void
    {
        $settings = [];
        foreach (AdSetting::getAll() as $row) {
            $settings[$row['network_name']] = [
                'is_active' => (bool)$row['is_active'],
                'settings' => json_decode($row['settings_json'] ?? 'null', true) ?: [],
            ];
        }
        view('ads/settings', ['networks' => self::NETWORKS, 'settings' => $settings]);
    }

    public static function save(): void
    {
        $network = $_POST['network'] ?? '';
        if (!in_array($network, self::NETWORKS, true)) {
            flash('Unknown ad network', 'danger');
            redirect('index.php?page=ads');
        }
        $fields = $_POST['fields'] ?? [];
        array_walk_recursive($fields, fn(&$v) => $v = trim((string)$v));
        AdSetting::save($network, $fields, !empty($_POST['is_active']));
        flash(ucfirst($network) . ' settings saved');
        redirect('index.php?page=ads');
    }

    public static function delete(): void
    {
        $network = $_GET['network'] ?? '';
        if (in_array($network, self::NETWORKS, true)) {
            AdSetting::delete($network);
            flash('Ad network settings cleared');
        }
        redirect('index.php?page=ads');
    }
}
