<?php
session_start();

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/app/helpers.php';
require_once dirname(__DIR__) . '/app/Controllers/InstallController.php';

require dirname(__DIR__) . '/routes/install.php';
