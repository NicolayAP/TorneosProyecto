import React, { useState } from 'react';
import { Search, Plus, ShieldAlert, Trash2, Pencil, X, Check, Phone, Mail, BadgeCheck } from 'lucide-react';
import { Referee } from '../types';
import { getReferees, addReferee, updateReferee, deleteReferee } from '../utils/storage';

export function RefereesView() {
  const [referees, setReferees] = useState<Referee[]>(getReferees());
  const [search, setSearch] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingReferee, setEditingReferee] = useState<Referee | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSpecializations, setFormSpecializations] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');

  const filteredReferees = referees.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.email && r.email.toLowerCase().includes(search.toLowerCase())) ||
    r.specializations.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormSpecializations('');
    setFormStatus('active');
  };

  const openAdd = () => {
    resetForm();
    setEditingReferee(null);
    setShowDrawer(true);
  };

  const openEdit = (ref: Referee) => {
    setEditingReferee(ref);
    setFormName(ref.name);
    setFormEmail(ref.email || '');
    setFormPhone(ref.phone || '');
    setFormSpecializations(ref.specializations.join(', '));
    setFormStatus(ref.status);
    setShowDrawer(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const specializations = formSpecializations
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (editingReferee) {
      const updated: Referee = {
        ...editingReferee,
        name: formName.trim(),
        email: formEmail.trim() || undefined,
        phone: formPhone.trim() || undefined,
        specializations,
        status: formStatus
      };
      updateReferee(updated);
    } else {
      const newReferee: Referee = {
        id: `ref_${Date.now()}`,
        name: formName.trim(),
        email: formEmail.trim() || undefined,
        phone: formPhone.trim() || undefined,
        specializations,
        status: formStatus
      };
      addReferee(newReferee);
    }

    setReferees(getReferees());
    setShowDrawer(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteReferee(id);
    setReferees(getReferees());
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-gray-900 md:text-2xl">Gestión de Árbitros</h2>
          <p className="text-xs text-gray-500">Registro, edición y control de árbitros autorizados</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-lg bg-[#0b1f18] px-4 py-2 text-xs font-semibold text-white hover:bg-black active:scale-95 transition-all"
        >
          <Plus size={14} />
          <span>Nuevo Árbitro</span>
        </button>
      </div>

      <div className="no-print relative flex items-center">
        <span className="absolute left-3.5 text-gray-400">
          <Search size={16} />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar árbitro por nombre, correo o especialidad..."
          className="w-full rounded-xl border border-gray-100 bg-white py-3 pl-10 pr-4 text-xs outline-hidden focus:border-[#fcba00] focus:ring-1 focus:ring-[#fcba00] shadow-2xs"
        />
      </div>

      {filteredReferees.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center shadow-xs">
          <ShieldAlert size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-700">
            {search ? 'No se encontraron árbitros' : 'No hay árbitros registrados'}
          </p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
            {search
              ? 'Intenta con otros términos de búsqueda.'
              : 'Crea el primer árbitro para poder asignarlo a los partidos.'}
          </p>
          {!search && (
            <button
              onClick={openAdd}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#0b1f18] px-4 py-2 text-xs font-semibold text-white hover:bg-black"
            >
              <Plus size={14} />
              Registrar Árbitro
            </button>
          )}
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredReferees.map((ref) => {
            const isActive = ref.status === 'active';
            return (
              <div
                key={ref.id}
                className={`group relative rounded-2xl border bg-white p-5 shadow-xs transition-all hover:shadow-md ${
                  isActive ? 'border-gray-100' : 'border-red-100 bg-red-50/5'
                }`}
              >
                <div className={`absolute top-0 bottom-0 left-0 w-1.5 rounded-l-2xl ${
                  isActive ? 'bg-emerald-500' : 'bg-red-400'
                }`} />

                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 uppercase font-display text-sm font-bold text-gray-400 border border-gray-100">
                    {ref.name.substring(0, 2)}
                  </div>
                  <div className="flex items-center gap-1">
                    {isActive ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-800 uppercase tracking-wider font-display flex items-center gap-1">
                        <BadgeCheck size={10} />
                        Activo
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-bold text-red-700 uppercase tracking-wider font-display">
                        Inactivo
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-display text-base font-bold text-[#0b1f18] group-hover:text-[#705d00] transition-colors">
                    {ref.name}
                  </h4>
                </div>

                <div className="mt-3 space-y-1.5">
                  {ref.email && (
                    <p className="flex items-center gap-1.5 text-[11px] text-gray-500">
                      <Mail size={12} className="text-gray-400 shrink-0" />
                      {ref.email}
                    </p>
                  )}
                  {ref.phone && (
                    <p className="flex items-center gap-1.5 text-[11px] text-gray-500">
                      <Phone size={12} className="text-gray-400 shrink-0" />
                      {ref.phone}
                    </p>
                  )}
                  {ref.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {ref.specializations.map((spec, i) => (
                        <span key={i} className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold text-gray-600 uppercase tracking-wider">
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 border-t border-gray-50 pt-3">
                  <button
                    onClick={() => openEdit(ref)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all"
                    title="Editar árbitro"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(ref.id)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all"
                    title="Eliminar árbitro"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {showDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white shadow-xl h-full flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="font-display text-lg font-bold text-gray-900">
                  {editingReferee ? 'Editar Árbitro' : 'Registrar Nuevo Árbitro'}
                </h3>
                <p className="text-xs text-gray-500">
                  {editingReferee ? 'Modifica los datos del árbitro' : 'Ingresa los datos del árbitro'}
                </p>
              </div>
              <button
                onClick={() => { setShowDrawer(false); resetForm(); }}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-900"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-800">1. Datos Generales</label>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej. Carlos Ruiz Pérez"
                    className="w-full rounded-lg border border-gray-200 p-2.5 text-xs outline-none focus:border-[#fcba00]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500">Correo Electrónico</label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="arbitro@correo.com"
                      className="w-full rounded-lg border border-gray-200 p-2.5 text-xs outline-none focus:border-[#fcba00]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500">Teléfono</label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+52 555 123 4567"
                      className="w-full rounded-lg border border-gray-200 p-2.5 text-xs outline-none focus:border-[#fcba00]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-gray-100 pt-5">
                <label className="block text-sm font-bold text-gray-800">2. Especialización y Estado</label>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500">Especialidades (separadas por coma)</label>
                  <input
                    type="text"
                    value={formSpecializations}
                    onChange={(e) => setFormSpecializations(e.target.value)}
                    placeholder="Fútbol Soccer, Fútbol Rápido, Baloncesto"
                    className="w-full rounded-lg border border-gray-200 p-2.5 text-xs outline-none focus:border-[#fcba00]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500">Estado</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormStatus('active')}
                      className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition-all ${
                        formStatus === 'active'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Check size={14} className="inline mr-1" />
                      Activo
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormStatus('inactive')}
                      className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition-all ${
                        formStatus === 'inactive'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <X size={14} className="inline mr-1" />
                      Inactivo
                    </button>
                  </div>
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
              <button
                type="button"
                onClick={() => { setShowDrawer(false); resetForm(); }}
                className="flex-1 rounded-xl border border-gray-200 py-3 text-xs font-bold text-gray-700 hover:bg-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!formName.trim()}
                className="flex-1 rounded-xl bg-[#0b1f18] py-3 text-xs font-bold text-white hover:bg-black transition-all disabled:opacity-55"
              >
                {editingReferee ? 'Guardar Cambios' : 'Registrar Árbitro'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-display text-lg font-bold text-gray-900">Eliminar Árbitro</h3>
            <p className="text-sm text-gray-500 mt-2">
              ¿Estás seguro de eliminar a <strong>{referees.find(r => r.id === confirmDelete)?.name}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
