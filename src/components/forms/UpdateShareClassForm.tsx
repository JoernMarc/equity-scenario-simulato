import React, { useState, useEffect, useMemo } from 'react';
import type { UpdateShareClassTransaction, ShareClass, LiquidationPreferenceType, AntiDilutionProtection } from '../../types';
import { TransactionType, TransactionStatus } from '../../types';
import { ANTI_DILUTION_TYPES, LIQUIDATION_PREFERENCE_TYPES } from '../../constants';
import { snakeToCamel } from '../../logic/utils';
import HelpTooltip from '../HelpTooltip';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useProject } from '../../contexts/ProjectContext';
import type { Translations } from '../../i18n';

interface UpdateShareClassFormProps {
  onSubmit: (transaction: UpdateShareClassTransaction) => void;
  onCancel: () => void;
  transactionToEdit?: UpdateShareClassTransaction;
}

const baseInputClasses = "mt-1 block w-full px-3 py-2 bg-surface border border-strong rounded-md shadow-sm focus:outline-none focus:ring-interactive focus:border-interactive";

function UpdateShareClassForm({ onSubmit, onCancel, transactionToEdit }: UpdateShareClassFormProps) {
  const { t } = useLocalization();
  const { allShareClasses: allShareClassesMap } = useProject();
  const allShareClasses = useMemo(() => Array.from(allShareClassesMap.values()), [allShareClassesMap]);
  const isEditing = !!transactionToEdit;

  const [date, setDate] = useState(transactionToEdit?.date || new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<TransactionStatus>(transactionToEdit?.status || TransactionStatus.DRAFT);
  const [validFrom, setValidFrom] = useState(transactionToEdit?.validFrom || new Date().toISOString().split('T')[0]);
  const [validTo, setValidTo] = useState(transactionToEdit?.validTo || '');
  
  const [selectedClassId, setSelectedClassId] = useState<string>(transactionToEdit?.shareClassIdToUpdate || '');
  const [formState, setFormState] = useState<Partial<Omit<ShareClass, 'id'>>>(transactionToEdit?.updatedProperties || {});

  const originalState = useMemo(() => {
    if (!selectedClassId) return null;
    return allShareClasses.find(sc => sc.id === selectedClassId) || null;
  }, [selectedClassId, allShareClasses]);

  useEffect(() => {
    if (originalState && !isEditing) {
      setFormState({ ...originalState });
    } else if (!selectedClassId) {
        setFormState({});
    }
  }, [originalState, isEditing]);
  
  const handleFormChange = <K extends keyof ShareClass>(field: K, value: ShareClass[K]) => {
    setFormState(prev => ({...prev, [field]: value}));
  };
  
   const handleProvisionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const provisions = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
    handleFormChange('protectiveProvisions', provisions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !originalState) return;

    const updatedProperties: Partial<Omit<ShareClass, 'id'>> = {};

    // Compare formState to originalState to find changes
    (Object.keys(formState) as Array<keyof Omit<ShareClass, 'id'>>).forEach(key => {
        const originalValue = originalState[key];
        const currentValue = formState[key];
        
        if (JSON.stringify(originalValue) !== JSON.stringify(currentValue)) {
            (updatedProperties as any)[key] = currentValue;
        }
    });

    if (Object.keys(updatedProperties).length === 0 && !isEditing) {
        alert(t.noPropertiesChanged);
        return;
    }

    const transaction: UpdateShareClassTransaction = {
      id: transactionToEdit?.id || crypto.randomUUID(),
      type: TransactionType.UPDATE_SHARE_CLASS,
      date,
      status,
      validFrom,
      validTo: validTo || undefined,
      shareClassIdToUpdate: selectedClassId,
      updatedProperties: isEditing ? (formState as Partial<Omit<ShareClass, 'id'>>) : updatedProperties,
    };

    onSubmit(transaction);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-xl font-semibold text-primary">{isEditing ? t.editUpdateShareClass : t.updateShareClass}</h3>
      
      <div>
        <label htmlFor="shareClassToUpdate" className="block text-sm font-medium text-secondary">{t.shareClassToUpdate}</label>
        <select 
            id="shareClassToUpdate" 
            value={selectedClassId} 
            onChange={e => setSelectedClassId(e.target.value)} 
            required 
            className={baseInputClasses}
            disabled={isEditing}
        >
          <option value="" disabled>{t.selectShareClassToUpdate}</option>
          {allShareClasses.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
        </select>
      </div>

      {selectedClassId && (
        <>
        <fieldset>
          <legend className="text-lg font-medium text-primary mb-2 flex items-center gap-2">{t.updatedProperties} <HelpTooltip text={t.help.updateShareClass} /></legend>
          <div className="space-y-4 p-4 bg-background-subtle rounded-lg border">
            <div>
                <label htmlFor="shareClassName" className="block text-sm font-medium text-secondary">{t.shareClassName}</label>
                <input id="shareClassName" type="text" value={formState.name || ''} onChange={e => handleFormChange('name', e.target.value)} required className={baseInputClasses}/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 <div>
                    <label htmlFor="liqPrefRank" className="flex items-center text-sm font-medium text-secondary">
                        {t.liquidationPreferenceRank}
                        <HelpTooltip text={t.help.liquidationPreferenceRank} />
                    </label>
                    <input id="liqPrefRank" type="number" min="0" value={formState.liquidationPreferenceRank ?? ''} onChange={e => handleFormChange('liquidationPreferenceRank', parseInt(e.target.value,10) || 0)} required className={`${baseInputClasses} text-right`}/>
                </div>
                 <div>
                    <label htmlFor="liqPrefFactor" className="flex items-center text-sm font-medium text-secondary">
                        {t.liquidationPreferenceFactor}
                        <HelpTooltip text={t.help.liquidationPreferenceFactor} />
                    </label>
                    <input id="liqPrefFactor" type="number" min="0" step="0.1" value={formState.liquidationPreferenceFactor ?? ''} onChange={e => handleFormChange('liquidationPreferenceFactor', parseFloat(e.target.value) || 0)} required className={`${baseInputClasses} text-right`}/>
                </div>
                 <div>
                    <label htmlFor="liqPrefType" className="flex items-center text-sm font-medium text-secondary">
                      {t.liquidationPreferenceType}
                       <HelpTooltip text={t.help.liquidationPreferenceType} />
                    </label>
                    <select id="liqPrefType" value={formState.liquidationPreferenceType || ''} onChange={e => handleFormChange('liquidationPreferenceType', e.target.value as LiquidationPreferenceType)} required className={baseInputClasses}>
                        {LIQUIDATION_PREFERENCE_TYPES.map(type => <option key={type} value={type}>{t[snakeToCamel(type) as keyof Translations] as string || type}</option>)}
                    </select>
                </div>
                 {formState.liquidationPreferenceType === 'CAPPED_PARTICIPATING' && (
                    <div>
                        <label htmlFor="participationCapFactor" className="flex items-center text-sm font-medium text-secondary">
                          {t.participationCapFactor}
                          <HelpTooltip text={t.help.participationCapFactor} />
                        </label>
                        <input 
                          id="participationCapFactor" 
                          type="number" min="1" 
                          value={formState.participationCapFactor ?? ''} 
                          onChange={e => handleFormChange('participationCapFactor', parseFloat(e.target.value) || undefined)} 
                          className={`${baseInputClasses} text-right`}/>
                    </div>
                )}
                 <div>
                    <label htmlFor="antiDilution" className="flex items-center text-sm font-medium text-secondary">
                      {t.antiDilutionProtection}
                       <HelpTooltip text={t.help.antiDilutionProtection} />
                    </label>
                    <select id="antiDilution" value={formState.antiDilutionProtection || ''} onChange={e => handleFormChange('antiDilutionProtection', e.target.value as AntiDilutionProtection)} required className={baseInputClasses}>
                         {ANTI_DILUTION_TYPES.map(type => <option key={type} value={type}>{t[snakeToCamel(type) as keyof Translations] as string || type}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="votesPerShare" className="flex items-center text-sm font-medium text-secondary">
                        {t.votesPerShare}
                         <HelpTooltip text={t.help.votesPerShare} />
                    </label>
                    <input id="votesPerShare" type="number" min="0" value={formState.votesPerShare ?? ''} onChange={e => handleFormChange('votesPerShare', parseInt(e.target.value, 10) || 0)} required className={`${baseInputClasses} text-right`}/>
                </div>
                 <div>
                    <label htmlFor="protectiveProvisions" className="flex items-center text-sm font-medium text-secondary">
                      {t.protectiveProvisions}
                       <HelpTooltip text={t.help.protectiveProvisions} />
                    </label>
                    <input id="protectiveProvisions" type="text" value={(formState.protectiveProvisions || []).join(', ')} onChange={handleProvisionsChange} className={baseInputClasses}/>
                </div>
            </div>
          </div>
        </fieldset>

         <fieldset className="pt-4 mt-4 border-t border-subtle">
            <legend className="text-lg font-medium text-primary mb-2">{t.statusAndValidity}</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="date" className="flex items-center text-sm font-medium text-secondary">
                      {t.date}
                      <HelpTooltip text={t.help.date} />
                  </label>
                  <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className={baseInputClasses}/>
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-secondary">{t.status}</label>
                  <select id="status" value={status} onChange={e => setStatus(e.target.value as TransactionStatus)} required className={baseInputClasses}>
                    <option value={TransactionStatus.DRAFT}>{t.draft}</option>
                    <option value={TransactionStatus.ACTIVE}>{t.active}</option>
                    <option value={TransactionStatus.ARCHIVED}>{t.archived}</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="validFrom" className="flex items-center text-sm font-medium text-secondary">
                      {t.validFrom}
                      <HelpTooltip text={t.help.validFrom} />
                  </label>
                  <input type="date" id="validFrom" value={validFrom} onChange={e => setValidFrom(e.target.value)} required className={baseInputClasses}/>
                </div>
                <div>
                  <label htmlFor="validTo" className="flex items-center text-sm font-medium text-secondary">
                      {t.validTo} <span className="text-subtle">({t.optional})</span>
                      <HelpTooltip text={t.help.validTo} />
                  </label>
                  <input type="date" id="validTo" value={validTo} onChange={e => setValidTo(e.target.value)} className={baseInputClasses}/>
                </div>
            </div>
          </fieldset>
        </>
      )}

      <div className="flex justify-end gap-4 pt-4 border-t border-subtle">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-background-subtle text-primary rounded-md hover:bg-background">{t.cancel}</button>
        <button type="submit" className="px-4 py-2 bg-interactive text-on-interactive rounded-md hover:bg-interactive-hover" disabled={!selectedClassId}>{isEditing ? t.update : t.save}</button>
      </div>
    </form>
  );
};

export default UpdateShareClassForm;