"use client";

import React, { useEffect, useState } from "react";
import { BarChartHorizontal } from "./BarChart";
import { Live3_PieChartLabels } from "./PieChart";
import { API_ROUTES } from "@/lib/routes/audit.routes";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

type StateData = {
    id: number;
    name: string;
    color: string;
    count: number;
    percentage: number;
};

type RecentIssue = {
    id: string;
    title: string;
    created_at: string;
};

type DashboardData = {
    states: StateData[];
    recentIssues: {
        content: RecentIssue[];
        totalPages: number;
        totalElements: number;
        size: number;
        number: number;
    };
    assignedIssues: {
        content: any[];
        totalPages: number;
        totalElements: number;
        size: number;
        number: number;
    };
};

interface DashboardProps {
    projectId: string;
    token: string;
    sprintId?: string;
    issueId?: string;
}

export default function Dashboard({ projectId, token, sprintId, issueId }: DashboardProps) {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                let apiUrl: string;
                
                if (issueId) {
                    apiUrl = API_ROUTES.GET_ISSUE_DASHBOARD({ projectId, issueId });
                } else if (sprintId) {
                    apiUrl = API_ROUTES.GET_SPRINT_DASHBOARD({ projectId, sprintId });
                } else {
                    apiUrl = API_ROUTES.GET_PROJECT_DASHBOARD({ projectId });
                }
                
                const response = await fetch(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Error al cargar los datos del dashboard");
                }

                const dashboardData = await response.json();
                setData(dashboardData);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error desconocido");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [projectId, sprintId, issueId, token]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--blue-700)]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <p className="font-medium" style={{ color: "var(--ds-error)" }}>{error}</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-8 text-center">
                <p style={{ color: "var(--ds-text-secondary)" }}>No hay datos disponibles</p>
            </div>
        );
    }

    const barChartData = data.states
        .filter((state) => state.count > 0)
        .map((state) => ({
            key: state.name,
            value: state.count,
            color: state.color,
        }))
        .sort((a, b) => b.value - a.value);

    const pieChartData = data.states
        .filter((state) => state.count > 0)
        .map((state) => ({
            name: state.name,
            value: state.count,
            percentage: state.percentage,
            colorFrom: state.color,
            colorTo: state.color,
        }));

    const recentIssues = data.recentIssues?.content || null;

    // Determinar si estamos viendo el dashboard de una tarea (para mostrar subtareas)
    const isIssueDashboard = !!issueId;
    const taskLabel = isIssueDashboard ? "Subtareas" : "Tareas";
    const taskLabelLower = isIssueDashboard ? "subtareas" : "tareas";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 h-[calc(95vh-200px)] max-h-[700px]">
            {/* Columna 1: Gráficos */}
            <div className="flex flex-col gap-6 overflow-y-auto pr-2">
                {/* Gráfico de Barras */}
                <div className="rounded-md p-6 flex flex-col min-h-0 flex-1" style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}>
                    <h3 className="text-base font-semibold mb-4 flex-shrink-0" style={{ color: "var(--ds-text)", letterSpacing: "-0.01em" }}>
                        {taskLabel} por Estado
                    </h3>
                    <div className="flex-1 min-h-0 flex items-center justify-center">
                        {barChartData.length > 0 ? (
                            <BarChartHorizontal data={barChartData} />
                        ) : (
                            <p className="text-center text-[13px]" style={{ color: "var(--ds-text-muted)" }}>
                                No hay {taskLabelLower} para mostrar
                            </p>
                        )}
                    </div>
                </div>

                {/* Gráfico de Pastel */}
                <div className="rounded-md p-6 flex flex-col min-h-0 flex-1" style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}>
                    <h3 className="text-base font-semibold mb-4 flex-shrink-0" style={{ color: "var(--ds-text)", letterSpacing: "-0.01em" }}>
                        Distribución de {taskLabel}
                    </h3>
                    <div className="flex-1 min-h-0 flex items-center justify-center">
                        {pieChartData.length > 0 ? (
                            <Live3_PieChartLabels data={pieChartData} />
                        ) : (
                            <p className="text-center text-[13px]" style={{ color: "var(--ds-text-muted)" }}>
                                No hay {taskLabelLower} para mostrar
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Columna 2: Tareas Recientes */}
            <div className="rounded-md p-6 flex flex-col h-full overflow-hidden" style={{ background: "var(--ds-card)", boxShadow: "var(--shadow-border)" }}>
                <h3 className="text-base font-semibold mb-4 flex-shrink-0" style={{ color: "var(--ds-text)", letterSpacing: "-0.01em" }}>
                    {taskLabel} Recientes
                </h3>
                {recentIssues && recentIssues.length > 0 ? (
                    <div className="space-y-2 overflow-y-auto pr-2 flex-1" style={{ scrollBehavior: 'smooth' }}>
                        {recentIssues.map((issue) => (
                            <Link href={`/tableros/${projectId}/${issue.id}`} target="_blank"
                                key={issue.id}
                                className="group flex items-center justify-between p-3 hover:bg-[var(--gray-alpha-100)] rounded-md transition-colors duration-150 border border-[var(--ds-border)]"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate text-[var(--ds-text)] group-hover:text-[var(--blue-900)] transition-colors duration-150">
                                        {issue.title}
                                    </p>
                                    <p className="text-xs mt-1 text-[var(--ds-text-muted)]">
                                        Creada el {formatDate(issue.created_at)}
                                    </p>
                                </div>
                                <span className="text-[var(--ds-text-muted)] group-hover:text-[var(--blue-700)] transition-colors duration-150">
                                    <ExternalLink size={16} strokeWidth={1.5} />
                                </span>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center flex-1">
                        <p className="text-center text-[13px]" style={{ color: "var(--ds-text-muted)" }}>
                            No hay {taskLabelLower} recientes
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}