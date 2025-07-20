
import React, { useState } from 'react';
import type { Translations } from '../i18n';
import type { SampleScenario } from '../types';
import PencilIcon from '../styles/icons/PencilIcon';
import TrashIcon from '../styles/icons/TrashIcon';
import PlusIcon from '../styles/icons/PlusIcon';
import UserGuide from './UserGuide';
import WorkflowDiagram from './WorkflowDiagram';
import InformationCircleIcon from '../styles/icons/InformationCircleIcon';

interface Project {
  id: string;
  name: string;
}

interface ProjectDashboardProps {
  projects: Project[];
  onCreateProject: (name: string) => void;
  onSelectProject: (id: string) => void;
  onRenameProject: (id: string, newName: string) => void;
  onDeleteProject: (id: string) => void;
  onLoadScenario: (scenarioData: SampleScenario['data']) => void;
  translations: Translations;
}

function ProjectDashboard({ projects, onCreateProject, onSelectProject, onRenameProject, onDeleteProject, onLoadScenario, translations }: ProjectDashboardProps) {
  const [newProjectName, setNewProjectName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamingName, setRenamingName] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim());
      setNewProjectName('');
    }
  };

  const handleRenameClick = (project: Project) => {
    setRenamingId(project.id);
    setRenamingName(project.name);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (renamingId && renamingName.trim()) {
      onRenameProject(renamingId, renamingName.trim());
      setRenamingId(null);
      setRenamingName('');
    }
  };
  
  const handleCancelRename = () => {
    setRenamingId(null);
    setRenamingName('');
  };

  const handleWorkflowNodeClick = (nodeId: string) => {
      if (nodeId === '1') { // Founding node
        const projectName = prompt(translations.enterProjectName);
        if (projectName && projectName.trim()) {
            onCreateProject(projectName.trim());
        }
      }
  };


  return (
    <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-12">
      <h2 className="text-3xl font-bold text-theme-primary text-center">{translations.projectsDashboard}</h2>

      <section>
        <h3 className="text-2xl font-bold text-theme-primary text-center mb-6">{translations.workflowTitle}</h3>
        <div className="flex justify-center">
            <WorkflowDiagram onNodeClick={handleWorkflowNodeClick} translations={translations} />
        </div>
      </section>

      <div className="bg-theme-surface p-6 rounded-lg shadow-md border border-theme-subtle">
        <h3 className="text-lg font-semibold text-theme-primary mb-4">{translations.createNewProject}</h3>
        <form onSubmit={handleCreateSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder={translations.enterProjectName}
            className="flex-grow w-full px-4 py-2 bg-theme-surface border border-theme-strong rounded-md shadow-sm focus:outline-none focus:ring-theme-interactive focus:border-theme-interactive"
            aria-label={translations.projectName}
          />
          <button
            type="submit"
            className="flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-theme-on-interactive bg-theme-interactive rounded-md shadow-sm hover:bg-theme-interactive-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-interactive disabled:bg-theme-disabled"
            disabled={!newProjectName.trim()}
          >
            <PlusIcon className="w-5 h-5" />
            <span>{translations.create}</span>
          </button>
        </form>
      </div>
      
      {/* Onboarding Hint */}
      <div className="mt-8 p-4 rounded-lg bg-theme-info-subtle-bg border border-blue-200 theme-high-contrast:border-blue-800">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-6 w-6 text-theme-info-subtle-text" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="font-bold text-theme-primary">{translations.projectDashboardHintTitle}</h3>
            <p className="text-sm text-theme-secondary mt-1">
              {translations.projectDashboardHintText}
            </p>
          </div>
        </div>
      </div>

       <div className="mt-12">
            <UserGuide 
                onLoadScenario={onLoadScenario}
                translations={translations}
            />
        </div>

      <div className="space-y-4">
        {projects.length > 0 && (
          projects.map((project) => (
            <div key={project.id} className="bg-theme-surface p-4 rounded-lg shadow-sm border border-theme-subtle flex items-center justify-between gap-4">
              {renamingId === project.id ? (
                <form onSubmit={handleRenameSubmit} className="flex-grow flex items-center gap-2">
                  <input
                    type="text"
                    value={renamingName}
                    onChange={(e) => setRenamingName(e.target.value)}
                    className="flex-grow px-3 py-1 bg-theme-surface border border-theme-interactive rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-theme-interactive"
                    autoFocus
                  />
                  <button type="submit" className="px-3 py-1 text-sm bg-theme-success text-theme-on-interactive rounded-md hover:bg-theme-success-hover">{translations.save}</button>
                  <button type="button" onClick={handleCancelRename} className="px-3 py-1 text-sm bg-theme-subtle rounded-md hover:bg-theme-background">{translations.cancel}</button>
                </form>
              ) : (
                <>
                  <button onClick={() => onSelectProject(project.id)} className="flex-grow text-left">
                    <span className="font-semibold text-theme-primary text-lg hover:text-theme-interactive">{project.name}</span>
                  </button>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button 
                        onClick={() => handleRenameClick(project)} 
                        className="p-2 text-theme-secondary hover:text-theme-interactive hover:bg-theme-subtle rounded-md"
                        title={translations.renameProject}
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => onDeleteProject(project.id)} 
                        className="p-2 text-theme-secondary hover:text-theme-danger hover:bg-theme-subtle rounded-md"
                        title={translations.delete}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}

export default ProjectDashboard;
