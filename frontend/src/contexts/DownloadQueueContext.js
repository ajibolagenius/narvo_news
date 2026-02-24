import React, { createContext, useContext, useState, useCallback } from 'react';
import { downloadAndCacheAudio } from '../lib/audioCache';

const DownloadQueueContext = createContext();

export const useDownloadQueue = () => {
  const context = useContext(DownloadQueueContext);
  if (!context) {
    throw new Error('useDownloadQueue must be used within DownloadQueueProvider');
  }
  return context;
};

export const DownloadQueueProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const [currentDownload, setCurrentDownload] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Add items to the download queue
  const addToQueue = useCallback((items) => {
    const newItems = items.map(item => ({
      ...item,
      status: 'pending',
      progress: 0,
      addedAt: Date.now()
    }));
    
    setQueue(prev => [...prev, ...newItems]);
    setTotalCount(prev => prev + newItems.length);
  }, []);

  // Add single item to queue
  const addSingleToQueue = useCallback((item) => {
    addToQueue([item]);
  }, [addToQueue]);

  // Process the download queue
  const processQueue = useCallback(async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    while (true) {
      // Get next pending item
      const pendingItem = queue.find(item => item.status === 'pending');
      if (!pendingItem) break;
      
      // Update item to downloading
      setQueue(prev => prev.map(item => 
        item.id === pendingItem.id 
          ? { ...item, status: 'downloading' } 
          : item
      ));
      setCurrentDownload(pendingItem);
      
      try {
        const success = await downloadAndCacheAudio(
          pendingItem.id,
          pendingItem.audioUrl,
          {
            title: pendingItem.title,
            source: pendingItem.source,
            duration: pendingItem.duration,
            type: pendingItem.type || 'podcast'
          },
          (progress) => {
            setQueue(prev => prev.map(item => 
              item.id === pendingItem.id 
                ? { ...item, progress } 
                : item
            ));
          }
        );
        
        // Update item status
        setQueue(prev => prev.map(item => 
          item.id === pendingItem.id 
            ? { ...item, status: success ? 'complete' : 'failed', progress: 100 } 
            : item
        ));
        
        if (success) {
          setCompletedCount(prev => prev + 1);
        }
      } catch (error) {
        console.error('Download failed:', error);
        setQueue(prev => prev.map(item => 
          item.id === pendingItem.id 
            ? { ...item, status: 'failed' } 
            : item
        ));
      }
    }
    
    setCurrentDownload(null);
    setIsProcessing(false);
  }, [queue, isProcessing]);

  // Start processing when items are added
  React.useEffect(() => {
    const hasPending = queue.some(item => item.status === 'pending');
    if (hasPending && !isProcessing) {
      processQueue();
    }
  }, [queue, isProcessing, processQueue]);

  // Clear completed downloads
  const clearCompleted = useCallback(() => {
    setQueue(prev => prev.filter(item => item.status !== 'complete'));
  }, []);

  // Clear all downloads
  const clearAll = useCallback(() => {
    setQueue([]);
    setCompletedCount(0);
    setTotalCount(0);
    setCurrentDownload(null);
    setIsProcessing(false);
  }, []);

  // Remove single item from queue
  const removeFromQueue = useCallback((id) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  }, []);

  // Calculate overall progress
  const overallProgress = totalCount > 0 
    ? Math.round((completedCount / totalCount) * 100)
    : 0;

  const pendingCount = queue.filter(item => item.status === 'pending').length;
  const downloadingCount = queue.filter(item => item.status === 'downloading').length;
  const failedCount = queue.filter(item => item.status === 'failed').length;

  const value = {
    queue,
    currentDownload,
    isProcessing,
    completedCount,
    totalCount,
    pendingCount,
    downloadingCount,
    failedCount,
    overallProgress,
    addToQueue,
    addSingleToQueue,
    clearCompleted,
    clearAll,
    removeFromQueue,
  };

  return (
    <DownloadQueueContext.Provider value={value}>
      {children}
    </DownloadQueueContext.Provider>
  );
};
