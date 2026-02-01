$user = App\Models\User::where('email', 'contato@oodelivery.online')->first();
if ($user) {
$user->password = Hash::make('Big2020@');
$user->save();
echo "--- SENHA ALTERADA COM SUCESSO ---";
} else {
echo "--- USUARIO NAO ENCONTRADO ---";
}