import { useState } from 'react';
import axios from 'axios';
import { Loader2, Search, MapPin } from 'lucide-react';
import { useToast } from '@/Hooks/useToast';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

interface AddressFormProps {
    onCancel: () => void;
    onSuccess: (address: any) => void;
    tenantId: string;
    customerId: string;
}

export default function AddressForm({ onCancel, onSuccess, tenantId, customerId }: AddressFormProps) {
    const [loading, setLoading] = useState(false);
    const [cepLoading, setCepLoading] = useState(false);
    const [form, setForm] = useState({
        zip_code: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
    });
    const { success, error: showError } = useToast();

    const handleCepBlur = async () => {
        const cep = form.zip_code.replace(/\D/g, '');
        if (cep.length !== 8) return;

        setCepLoading(true);
        try {
            const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
            if (response.data.erro) {
                showError('CEP não encontrado', 'Verifique o CEP digitado.');
                return;
            }
            setForm(prev => ({
                ...prev,
                street: response.data.logradouro,
                neighborhood: response.data.bairro,
                city: response.data.localidade,
                state: response.data.uf,
            }));
        } catch (err) {
            showError('Erro ao buscar CEP', 'Tente preencher manualmente.');
        } finally {
            setCepLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('/customer/addresses', {
                ...form,
                tenant_id: tenantId,
                customer_id: customerId,
            });

            success('Endereço adicionado!', 'Seu novo endereço foi salvo.');
            onSuccess(response.data);
        } catch (err: any) {
            showError('Erro ao salvar', err.response?.data?.message || 'Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Novo Endereço</h3>
                <button type="button" onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700">
                    Cancelar
                </button>
            </div>

            <div>
                <InputLabel htmlFor="zip_code" value="CEP" />
                <div className="relative">
                    <TextInput
                        id="zip_code"
                        value={form.zip_code}
                        onChange={e => setForm({ ...form, zip_code: e.target.value })}
                        onBlur={handleCepBlur}
                        className="w-full pl-10"
                        placeholder="00000-000"
                        required
                    />
                    <div className="absolute left-3 top-2.5 text-gray-400">
                        {cepLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    <InputLabel htmlFor="street" value="Rua / Avenida" />
                    <TextInput
                        id="street"
                        value={form.street}
                        onChange={e => setForm({ ...form, street: e.target.value })}
                        className="w-full"
                        required
                    />
                </div>
                <div>
                    <InputLabel htmlFor="number" value="Número" />
                    <TextInput
                        id="number"
                        value={form.number}
                        onChange={e => setForm({ ...form, number: e.target.value })}
                        className="w-full"
                        required
                    />
                </div>
            </div>

            <div>
                <InputLabel htmlFor="complement" value="Complemento (Opcional)" />
                <TextInput
                    id="complement"
                    value={form.complement}
                    onChange={e => setForm({ ...form, complement: e.target.value })}
                    className="w-full"
                    placeholder="Ap 102, Bloco C..."
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <InputLabel htmlFor="neighborhood" value="Bairro" />
                    <TextInput
                        id="neighborhood"
                        value={form.neighborhood}
                        onChange={e => setForm({ ...form, neighborhood: e.target.value })}
                        className="w-full"
                        required
                    />
                </div>
                <div>
                    <InputLabel htmlFor="city" value="Cidade - UF" />
                    <TextInput
                        id="city"
                        value={`${form.city} - ${form.state}`}
                        readOnly
                        className="w-full bg-gray-50"
                    />
                </div>
            </div>

            <div className="pt-4 flex gap-3">
                <SecondaryButton type="button" onClick={onCancel} className="flex-1 justify-center">
                    Voltar
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={loading} className="flex-1 justify-center bg-[#ff3d03] hover:bg-[#e63700]">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Endereço'}
                </PrimaryButton>
            </div>
        </form>
    );
}
