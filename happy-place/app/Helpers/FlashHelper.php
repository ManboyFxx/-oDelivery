<?php

if (!function_exists('flash_success')) {
    /**
     * Flash a success toast message
     *
     * @param string $title
     * @param string $description
     * @return void
     */
    function flash_success(string $title, string $description): void
    {
        session()->flash('toast', [
            'variant' => 'success',
            'title' => $title,
            'description' => $description,
        ]);
    }
}

if (!function_exists('flash_error')) {
    /**
     * Flash an error toast message
     *
     * @param string $title
     * @param string $description
     * @return void
     */
    function flash_error(string $title, string $description): void
    {
        session()->flash('toast', [
            'variant' => 'error',
            'title' => $title,
            'description' => $description,
        ]);
    }
}

if (!function_exists('flash_warning')) {
    /**
     * Flash a warning toast message
     *
     * @param string $title
     * @param string $description
     * @return void
     */
    function flash_warning(string $title, string $description): void
    {
        session()->flash('toast', [
            'variant' => 'warning',
            'title' => $title,
            'description' => $description,
        ]);
    }
}

if (!function_exists('flash_info')) {
    /**
     * Flash an info toast message
     *
     * @param string $title
     * @param string $description
     * @return void
     */
    function flash_info(string $title, string $description): void
    {
        session()->flash('toast', [
            'variant' => 'info',
            'title' => $title,
            'description' => $description,
        ]);
    }
}
