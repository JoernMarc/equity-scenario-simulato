
import React, { createContext, useMemo, useContext } from 'react';
import type { Project, ShareClass, Stakeholder, Transaction, FoundingTransaction } from '../types';
import { getShareClassesAsOf } from '../logic/calculations';

interface ProjectContextType {
    transactions: Transaction[];
    stakeholders: Stakeholder[];
    allShareClasses: Map<string, ShareClass>;
    projectCurrency: string;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ project, children }: { project: Project | null, children: React.ReactNode }) => {
    const value = useMemo<ProjectContextType | undefined>(() => {
        if (!project) {
            return undefined;
        }

        const allShareClasses = getShareClassesAsOf(project.transactions, new Date().toISOString().split('T')[0]);
        const foundingTx = project.transactions.find(tx => tx.type === 'FOUNDING') as FoundingTransaction | undefined;
        const projectCurrency = foundingTx?.currency || 'EUR';

        return {
            transactions: project.transactions,
            stakeholders: project.stakeholders,
            allShareClasses,
            projectCurrency,
        };
    }, [project]);

    if (!value) {
        return <>{children}</>;
    }

    return (
        <ProjectContext.Provider value={value}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
};
