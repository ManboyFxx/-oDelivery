import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Link } from '@inertiajs/react';
import { LogOut, Settings, User } from 'lucide-react';

interface UserMenuProps {
    user: {
        name: string;
        email: string;
        avatar_url?: string;
    };
}

export default function UserMenu({ user }: UserMenuProps) {
    return (
        <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                {user.avatar_url ? (
                    <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-8 h-8 bg-[#ff3d03] rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                )}
                <div className="hidden sm:block text-left">
                    <p className="text-sm font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                </div>
            </Menu.Button>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-lg border border-gray-200 divide-y divide-gray-100 focus:outline-none z-50">
                    <div className="px-4 py-3">
                        <p className="text-sm font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                    </div>

                    <div className="px-2 py-2">
                        <Menu.Item>
                            {({ active }) => (
                                <Link
                                    href={route('motoboy.profile')}
                                    className={`
                                        flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm
                                        ${active ? 'bg-orange-50 text-[#ff3d03]' : 'text-gray-700 hover:bg-gray-50'}
                                    `}
                                >
                                    <User className="w-4 h-4" />
                                    Meu Perfil
                                </Link>
                            )}
                        </Menu.Item>

                        <Menu.Item>
                            {({ active }) => (
                                <a
                                    href="#"
                                    className={`
                                        flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm
                                        ${active ? 'bg-orange-50 text-[#ff3d03]' : 'text-gray-700 hover:bg-gray-50'}
                                    `}
                                >
                                    <Settings className="w-4 h-4" />
                                    Configurações
                                </a>
                            )}
                        </Menu.Item>
                    </div>

                    <div className="px-2 py-2">
                        <Menu.Item>
                            {({ active }) => (
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    className={`
                                        flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm
                                        ${active ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'}
                                    `}
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sair
                                </Link>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
}
