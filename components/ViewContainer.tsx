
import React from 'react';

interface ViewContainerProps {
    title: string;
    icon: string;
    actionButton?: React.ReactNode;
    children: React.ReactNode;
    bgColor?: string;
    textColor?: string;
    borderColor?: string;
}

const ViewContainer: React.FC<ViewContainerProps> = ({ title, icon, actionButton, children, bgColor = "bg-transparent", textColor = "text-gray-900 dark:text-gray-100", borderColor = "border-gray-200 dark:border-gray-700/50" }) => {
    return (
        <div className={`${bgColor} p-4 sm:p-6 mb-6 animate-fadeIn transition-colors duration-500`}>
            {children}
        </div>
    );
};

export default ViewContainer;

