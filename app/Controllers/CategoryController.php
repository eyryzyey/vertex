<?php
class CategoryController
{
    public static function index(): void
    {
        $edit = null;
        if (($_GET['action'] ?? '') === 'edit') {
            $edit = Category::getById((int)($_GET['id'] ?? 0));
        }
        view('categories/form', ['categories' => Category::getAll(), 'edit' => $edit]);
    }

    public static function store(): void
    {
        $name = trim($_POST['name'] ?? '');
        $type = $_POST['type'] ?? 'general';
        if ($name !== '') {
            Category::create($name, $type);
            flash('Category created successfully');
        } else {
            flash('Category name is required', 'danger');
        }
        redirect('index.php?page=categories');
    }

    public static function update(): void
    {
        $id = (int)($_POST['id'] ?? 0);
        $name = trim($_POST['name'] ?? '');
        if ($id && $name !== '') {
            Category::update($id, $name, $_POST['type'] ?? 'general');
            flash('Category updated successfully');
        }
        redirect('index.php?page=categories');
    }

    public static function delete(): void
    {
        $id = (int)($_GET['id'] ?? 0);
        if ($id) {
            Category::delete($id);
            flash('Category deleted');
        }
        redirect('index.php?page=categories');
    }
}
