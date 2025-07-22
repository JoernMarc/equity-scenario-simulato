

import React, { useState } from 'react';
import type { SampleScenario } from '../types';
import PencilIcon from '../styles/icons/PencilIcon';
import TrashIcon from '../styles/icons/TrashIcon';
import PlusIcon from '../styles/icons/PlusIcon';
import UserGuide from './UserGuide';
import WorkflowDiagram from './WorkflowDiagram';
import InformationCircleIcon from '../styles/icons/InformationCircleIcon';
import { useLocalization } from '../contexts/LocalizationContext';

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
  onStartComparison: (projectIds: [string, string]) => void;
}

function ProjectDashboard({ projects, onCreateProject, onSelectProject, onRenameProject, onDeleteProject, onLoadScenario, onStartComparison }: ProjectDashboardProps) {
  const { t: translations } = useLocalization();
  const [newProjectName, setNewProjectName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamingName, setRenamingName] = useState('');
  
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

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
  
  const toggleComparisonSelection = (projectId: string) => {
      setSelectedForComparison(prev => {
          if(prev.includes(projectId)) {
              return prev.filter(id => id !== projectId);
          }
          if(prev.length < 2) {
              return [...prev, projectId];
          }
          return prev; // Max 2 selections
      });
  }

  const handleStartComparisonClick = () => {
      if(selectedForComparison.length === 2) {
          onStartComparison(selectedForComparison as [string, string]);
      }
  }


  return (
    <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-12">
      <h2 className="text-3xl font-bold text-primary text-center">{translations.projectsDashboard}</h2>

      <section>
        <h3 className="text-2xl font-bold text-primary text-center mb-6">{translations.workflowTitle}</h3>
        <div className="flex justify-center">
            <WorkflowDiagram onNodeClick={handleWorkflowNodeClick} />
        </div>
      </section>

      <div className="bg-surface p-6 rounded-lg shadow-md border border-subtle">
        <h3 className="text-lg font-semibold text-primary mb-4">{translations.createNewProject}</h3>
        <form onSubmit={handleCreateSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder={translations.enterProjectName}
            className="flex-grow w-full px-4 py-2 bg-surface border border-strong rounded-md shadow-sm focus:outline-none focus:ring-interactive focus:border-interactive"
            aria-label={translations.projectName}
          />
          <button
            type="submit"
            className="flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-on-interactive bg-interactive rounded-md shadow-sm hover:bg-interactive-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-interactive disabled:bg-disabled"
            disabled={!newProjectName.trim()}
          >
            <PlusIcon className="w-5 h-5" />
            <span>{translations.create}</span>
          </button>
        </form>
      </div>
      
      {/* Onboarding Hint */}
      <div className="mt-8 p-4 rounded-lg bg-info-subtle-bg border border-blue-200 theme-high-contrast:border-info-subtle-text">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-6 w-6 text-info-subtle-text" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="font-bold text-primary">{translations.projectDashboardHintTitle}</h3>
            <p className="text-sm text-secondary mt-1">
              {translations.projectDashboardHintText}
            </p>
          </div>
        </div>
      </div>

       <div className="mt-12">
            <UserGuide 
                onLoadScenario={onLoadScenario}
            />
        </div>

      <section className="mt-12">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-primary">{translations.myProjectsTitle}</h3>
            <div className="flex items-center gap-4">
                {isComparisonMode && (
                     <button
                        onClick={handleStartComparisonClick}
                        className="px-4 py-2 text-sm font-medium text-on-interactive bg-success rounded-md shadow-sm hover:bg-success-hover disabled:bg-disabled"
                        disabled={selectedForComparison.length !== 2}
                    >
                        {translations.startComparison} ({selectedForComparison.length}/2)
                    </button>
                )}
                <button
                    onClick={() => { 
                        setIsComparisonMode(!isComparisonMode);
                        setSelectedForComparison([]);
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors ${isComparisonMode ? 'bg-background text-primary' : 'bg-interactive text-on-interactive hover:bg-interactive-hover'}`}
                >
                    {isComparisonMode ? translations.cancel : translations.compareProjects}
                </button>
            </div>
        </div>

        <div className="space-y-4">
          {projects.length > 0 ? (
            projects.map((project) => (
              <div key={project.id} className="bg-surface p-4 rounded-lg shadow-sm border border-subtle flex items-center justify-between gap-4">
                {renamingId === project.id ? (
                  <form onSubmit={handleRenameSubmit} className="flex-grow flex items-center gap-2">
                    <input
                      type="text"
                      value={renamingName}
                      onChange={(e) => setRenamingName(e.target.value)}
                      className="flex-grow px-3 py-1 bg-surface border border-interactive rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-interactive"
                      autoFocus
                    />
                    <button type="submit" className="px-3 py-1 text-sm bg-success text-on-interactive rounded-md hover:bg-success-hover">{translations.save}</button>
                    <button type="button" onClick={handleCancelRename} className="px-3 py-1 text-sm bg-background-subtle rounded-md hover:bg-background">{translations.cancel}</button>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center gap-4 flex-grow">
                        {isComparisonMode && (
                             <input
                                type="checkbox"
                                checked={selectedForComparison.includes(project.id)}
                                onChange={() => toggleComparisonSelection(project.id)}
                                className="h-5 w-5 rounded border-strong text-interactive focus:ring-interactive cursor-pointer accent-interactive"
                                aria-label={`Select ${project.name} for comparison`}
                             />
                        )}
                        <button onClick={() => onSelectProject(project.id)} className="flex-grow text-left">
                          <span className="font-semibold text-primary text-lg hover:text-interactive">{project.name}</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button 
                          onClick={() => handleRenameClick(project)} 
                          className="p-2 text-secondary hover:text-interactive hover:bg-background-subtle rounded-md"
                          title={translations.renameProject}
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button 
                          onClick={() => onDeleteProject(project.id)} 
                          className="p-2 text-secondary hover:text-danger hover:bg-background-subtle rounded-md"
                          title={translations.delete}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10 px-4 bg-surface rounded-lg shadow-sm border border-subtle">
              <p className="text-secondary">{translations.noProjects}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default ProjectDashboard;