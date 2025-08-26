const API_BASE = '';

export const trackImpression = async (contentId: string, category: string) => {
  try {
    console.log(`👀 Posting Impression: ${contentId} (${category})`);
    
    // const response = await fetch(`${API_BASE}/posts`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     type: 'impression',
    //     contentId,
    //     category,
    //     timestamp: new Date().toISOString(),
    //     userId: 'user_123', 
    //     sessionId: Date.now().toString() 
    //   })
    // });

    // const result = await response.json();
    // console.log('✅ Impression posted successfully:', result.id);
    
    // return { success: true, data: result };
  } catch (error) {
    console.error('❌ Failed to post impression:', error);
    return { success: false, error };
  }
};

// Post click when user clicks a card
export const trackClick = async (contentId: string, category: string) => {
  try {
    console.log(`🔥 Posting Click: ${contentId} (${category})`);
    
    // const response = await fetch(`${API_BASE}/posts`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     type: 'click',
    //     contentId,
    //     category,
    //     timestamp: new Date().toISOString(),
    //     userId: 'user_123',
    //     sessionId: Date.now().toString() 
    //   })
    // });

    // const result = await response.json();
    // console.log('✅ Click posted successfully:', result.id);
    
    // return { success: true, data: result };
  } catch (error) {
    console.error('❌ Failed to post click:', error);
    return { success: false, error };
  }
};

export const getAnalytics = async () => {
  try {
    const response = await fetch(`${API_BASE}/posts`);
    const posts = await response.json();
    
    const analyticsData = posts.filter((post: any) => 
      post.type === 'impression' || post.type === 'click'
    );
    
    console.log('📊 Analytics Data:', analyticsData);
    return analyticsData;
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return [];
  }
};